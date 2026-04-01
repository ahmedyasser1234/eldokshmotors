import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rental } from '../reservations/entities/rental.entity';
import { Sale } from '../sales/entities/sale.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { RentalStatus } from '../../common/enums';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Rental)
    private rentalRepository: Repository<Rental>,
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async getSummary() {
    const totalRentals = await this.rentalRepository.count();
    const totalSales = await this.saleRepository.count();
    const totalVehicles = await this.vehicleRepository.count();

    const revenueFromRentals = await this.rentalRepository
      .createQueryBuilder('rental')
      .select('SUM(rental.total_price)', 'sum')
      .getRawOne();

    const revenueFromSales = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.final_price)', 'sum')
      .getRawOne();

    const vehicleUtilization = totalVehicles > 0 
      ? (await this.rentalRepository.count({ where: { status: RentalStatus.ACTIVE } })) / totalVehicles 
      : 0;

    return {
      totalRentals,
      totalSales,
      totalVehicles,
      totalRevenue: Number(revenueFromRentals.sum || 0) + Number(revenueFromSales.sum || 0),
      utilizationRate: vehicleUtilization,
    };
  }

  async getTopVehicles() {
    return this.rentalRepository
      .createQueryBuilder('rental')
      .leftJoinAndSelect('rental.vehicle', 'vehicle')
      .select('vehicle.id', 'id')
      .addSelect('vehicle.make_ar', 'make_ar')
      .addSelect('vehicle.make_en', 'make_en')
      .addSelect('vehicle.model_ar', 'model_ar')
      .addSelect('vehicle.model_en', 'model_en')
      .addSelect('COUNT(rental.id)', 'count')
      .groupBy('vehicle.id')
      .addGroupBy('vehicle.make_ar')
      .addGroupBy('vehicle.make_en')
      .addGroupBy('vehicle.model_ar')
      .addGroupBy('vehicle.model_en')
      .orderBy('count', 'DESC')
      .limit(5)
      .getRawMany();
  }

  async getTopCustomers() {
    return this.rentalRepository
      .createQueryBuilder('rental')
      .leftJoinAndSelect('rental.customer', 'customer')
      .select('customer.id', 'id')
      .addSelect('customer.name', 'name')
      .addSelect('COUNT(rental.id)', 'count')
      .addSelect('SUM(rental.total_price)', 'totalSpent')
      .groupBy('customer.id')
      .addGroupBy('customer.name')
      .orderBy('totalSpent', 'DESC')
      .limit(5)
      .getRawMany();
  }

  async getRecentActivity() {
    const recentRentals = await this.rentalRepository.find({
      order: { created_at: 'DESC' },
      take: 5,
      relations: ['customer', 'vehicle'],
    });

    const recentSales = await this.saleRepository.find({
      order: { sale_date: 'DESC' },
      take: 5,
      relations: ['customer', 'vehicle'],
    });

    return { recentRentals, recentSales };
  }
}
