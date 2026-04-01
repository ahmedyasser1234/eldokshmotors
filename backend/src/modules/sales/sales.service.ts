import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { User } from '../users/entities/user.entity';
import { SaleStatus, VehicleStatus, PaymentStatus, PaymentMethod } from '../../common/enums';
import { NotificationsService } from '../notifications/notifications.service';
import { Payment } from '../payments/entities/payment.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private notificationsService: NotificationsService,
  ) {}

  async createSale(data: { userId: string; vehicleId: string; finalPrice: number; payment_method?: string; receipt_url?: string }) {
    const vehicle = await this.vehicleRepository.findOne({ where: { id: data.vehicleId } });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    if (vehicle.status === VehicleStatus.SOLD) throw new BadRequestException('Vehicle already sold');

    const user = await this.userRepository.findOne({ where: { id: data.userId } });
    if (!user) throw new NotFoundException('User not found');
    
    // Allow admins to purchase for testing

    // Check if a PENDING sale already exists for this user and vehicle to prevent duplicates
    const existingSale = await this.saleRepository.findOne({
      where: {
        customer: { id: user.id },
        vehicle: { id: vehicle.id },
        status: SaleStatus.PENDING
      }
    });

    if (existingSale) {
      return existingSale;
    }

    const sale = this.saleRepository.create({
      customer: user,
      vehicle: vehicle,
      final_price: data.finalPrice,
      status: SaleStatus.PENDING,
      payment_method: data.payment_method,
      receipt_url: data.receipt_url,
    });

    const savedSale = await this.saleRepository.save(sale);

    // Create a Payment record for the transaction history
    try {
      const payment = this.paymentRepository.create({
        user: user,
        amount: data.finalPrice,
        reference_id: savedSale.id,
        reference_type: 'sale',
        payment_method: (data.payment_method as any) || PaymentMethod.ONLINE,
        payment_status: PaymentStatus.PENDING,
        transaction_id: `TXN-S-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      });
      await this.paymentRepository.save(payment);
    } catch (err) {
      console.error('Failed to create payment record:', err);
    }

    // Notify Customer
    await this.notificationsService.notify(
      'notifications.sales.received.title',
      'notifications.sales.received.message',
      user.id,
      { 
        make: vehicle.make_en || vehicle.make_ar, 
        model: vehicle.model_en || vehicle.model_ar 
      }
    );

    // Notify Admins Real-time
    try {
      const admins = await this.userRepository.find({ where: { role: 'admin' as any } });
      const adminIds = admins.map(a => a.id);
      await this.notificationsService.notifyAdmins(
        'notifications.sales.admin_new.title',
        'notifications.sales.admin_new.message',
        adminIds,
        { 
          type: 'sale',
          is_receipt: !!data.receipt_url,
          userName: user.name, 
          make: vehicle.make_en || vehicle.make_ar, 
          model: vehicle.model_en || vehicle.model_ar 
        }
      );
    } catch (err) {
      console.error('Failed to notify admins:', err);
    }

    return savedSale;
  }

  async completeSale(id: string) {
    const sale = await this.saleRepository.findOne({ 
      where: { id }, 
      relations: ['vehicle', 'customer'] 
    });
    if (!sale) throw new NotFoundException('Sale not found');

    sale.status = SaleStatus.COMPLETED;
    await this.saleRepository.save(sale);

    // Update corresponding payment status or create it if missing
    try {
      let payment = await this.paymentRepository.findOne({
        where: { reference_id: sale.id, reference_type: 'sale' }
      });
      
      if (payment) {
        payment.payment_status = PaymentStatus.COMPLETED;
        await this.paymentRepository.save(payment);
      } else {
        // Self-heal: Create missing payment record if it didn't exist
        payment = this.paymentRepository.create({
          user: sale.customer,
          amount: sale.final_price,
          reference_id: sale.id,
          reference_type: 'sale',
          payment_method: (sale.payment_method as any) || PaymentMethod.ONLINE,
          payment_status: PaymentStatus.COMPLETED,
          transaction_id: `TXN-S-RECOVER-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
        });
        await this.paymentRepository.save(payment);
      }
    } catch (err) {
      console.error('Failed to update/create payment status:', err);
    }

    // Update vehicle status to strictly 'reserved' when initially completed 
    // The admin takes them from 'reserved' to 'sold' directly later when final balance is cleared.
    await this.vehicleRepository.update(sale.vehicle.id, { status: VehicleStatus.RESERVED });

    await this.notificationsService.notify(
      'notifications.sales.completed.title',
      'notifications.sales.completed.message',
      sale.customer.id,
      { 
        make: sale.vehicle.make_en || sale.vehicle.make_ar, 
        model: sale.vehicle.model_en || sale.vehicle.model_ar 
      }
    );

    return sale;
  }

  async rejectSale(id: string) {
    const sale = await this.saleRepository.findOne({ 
      where: { id }, 
      relations: ['customer', 'vehicle'] 
    });
    if (!sale) throw new NotFoundException('Sale not found');

    sale.status = SaleStatus.REJECTED;
    await this.saleRepository.save(sale);

    await this.notificationsService.notify(
      'notifications.sales.rejected.title',
      'notifications.sales.rejected.message',
      sale.customer.id,
      { 
        make: sale.vehicle.make_en || sale.vehicle.make_ar, 
        model: sale.vehicle.model_en || sale.vehicle.model_ar 
      }
    );

    return sale;
  }

  async getRecentSoldSales() {
    return this.saleRepository.find({
      where: { status: SaleStatus.COMPLETED },
      relations: ['vehicle', 'customer'],
      order: { updated_at: 'DESC' },
      take: 5,
    });
  }

  async findByUser(userId: string) {
    return this.saleRepository.find({
      where: { customer: { id: userId } },
      relations: ['vehicle'],
      order: { sale_date: 'DESC' },
    });
  }

  async findAll() {
    return this.saleRepository.find({ relations: ['customer', 'vehicle'] });
  }

  async findOne(id: string) {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: ['customer', 'vehicle'],
    });
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  async remove(id: string) {
    const sale = await this.saleRepository.findOne({ where: { id } });
    if (!sale) throw new NotFoundException('Sale not found');

    await this.saleRepository.delete(id);
    return { success: true, message: 'Sale deleted successfully' };
  }
}
