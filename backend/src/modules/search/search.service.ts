import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { VehicleStatus, VehicleCategory } from '../../common/enums';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async searchVehicles(filters: {
    make?: string;
    model?: string;
    category?: VehicleCategory;
    minPrice?: number;
    maxPrice?: number;
    status?: VehicleStatus;
    year?: number;
  }) {
    const query = this.vehicleRepository.createQueryBuilder('vehicle');

    if (filters.make) {
      query.andWhere('(vehicle.make_ar ILIKE :make OR vehicle.make_en ILIKE :make)', { make: `%${filters.make}%` });
    }
    
    if (filters.model) {
      query.andWhere('(vehicle.model_ar ILIKE :model OR vehicle.model_en ILIKE :model)', { model: `%${filters.model}%` });
    }

    if (filters.category) {
      query.andWhere('vehicle.category = :category', { category: filters.category });
    }

    if (filters.status) {
      query.andWhere('vehicle.status = :status', { status: filters.status });
    }

    if (filters.year) {
      query.andWhere('vehicle.year = :year', { year: filters.year });
    }

    if (filters.minPrice) {
      query.andWhere('(vehicle.rent_price_per_day >= :minPrice OR vehicle.sale_price >= :minPrice)', {
        minPrice: filters.minPrice,
      });
    }

    if (filters.maxPrice) {
      query.andWhere('(vehicle.rent_price_per_day <= :maxPrice OR vehicle.sale_price <= :maxPrice)', {
        maxPrice: filters.maxPrice,
      });
    }

    return query.getMany();
  }
}
