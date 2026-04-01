import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { PurchaseRequest } from './entities/purchase-request.entity';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { UpdatePurchaseRequestStatusDto } from './dto/update-purchase-request-status.dto';
import { ConfirmPurchaseDto } from './dto/confirm-purchase.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { DataSource } from 'typeorm';
import { PurchaseRequestStatus, VehicleStatus } from '../../common/enums';

@Injectable()
export class PurchaseRequestsService {
  constructor(
    @InjectRepository(PurchaseRequest)
    private purchaseRequestRepository: Repository<PurchaseRequest>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
    private vehiclesService: VehiclesService,
    private dataSource: DataSource,
  ) {}

  async confirmPurchase(id: string, confirmDto: ConfirmPurchaseDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const request = await this.findOne(id);
      
      if (request.status === PurchaseRequestStatus.PURCHASED) {
        throw new BadRequestException('This request has already been purchased and added to fleet.');
      }

      // Create new vehicle
      const vehicle = await this.vehiclesService.create({
        make_ar: confirmDto.make_ar,
        make_en: confirmDto.make_en,
        model_ar: confirmDto.model_ar,
        model_en: confirmDto.model_en,
        year: confirmDto.year,
        category: confirmDto.category,
        status: VehicleStatus.AVAILABLE,
        sale_price: confirmDto.sale_price,
        description_ar: confirmDto.description_ar || request.description,
        description_en: confirmDto.description_en || request.description,
        image_urls: request.image_urls,
        details: {
          mileage: confirmDto.mileage,
          engine_size: confirmDto.engine_size,
          transmission: confirmDto.transmission,
          fuel_type: confirmDto.fuel_type,
          exterior_color: confirmDto.exterior_color,
          interior_color: confirmDto.interior_color,
          vin: confirmDto.vin,
          original_request_id: request.id,
        }
      });

      // Link and update pricing/installments
      vehicle.purchase_request_id = request.id;
      vehicle.reservation_price = confirmDto.reservation_price as any;
      if (confirmDto.has_installments) {
        vehicle.installment_info = confirmDto.installment_info as any;
      }

      await queryRunner.manager.save(vehicle);

      // Update request status
      request.status = PurchaseRequestStatus.PURCHASED;
      await queryRunner.manager.save(request);

      await queryRunner.commitTransaction();

      // Notify User Real-time
      if (request.user) {
        await this.notificationsService.notify(
          'notifications.purchase.confirmed.title',
          'notifications.purchase.confirmed.message',
          request.user.id,
          { 
            make: request.make, 
            model: request.model 
          }
        );
      }

      return vehicle;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async create(createDto: CreatePurchaseRequestDto, user?: User) {
    // Prevent admins from submitting sell requests
    if (user && user.role === 'admin') {
      throw new BadRequestException('Admins are not allowed to submit sale requests. Please use a regular customer account.');
    }

    // Check for duplicate requests from the same user for the same car within the last 10 seconds
    if (user) {
      const tenSecondsAgo = new Date(Date.now() - 10000);
      const existing = await this.purchaseRequestRepository.findOne({
        where: {
          user: { id: user.id },
          make: createDto.make,
          model: createDto.model,
          created_at: MoreThan(tenSecondsAgo)
        }
      });
      if (existing) return existing;
    }

    const request = this.purchaseRequestRepository.create({
      ...createDto,
      user,
    });
    const savedRequest = await this.purchaseRequestRepository.save(request);

    // Notify all admins Real-time
    try {
      const admins = await this.usersService.findAdmins();
      const adminIds = admins.map(a => a.id);
      const clientName = createDto.client_name || user?.name || 'A guest';
      
      await this.notificationsService.notifyAdmins(
        'notifications.purchase.admin_new.title',
        'notifications.purchase.admin_new.message',
        adminIds,
        { 
          type: 'purchase_request',
          clientName, 
          make: createDto.make, 
          model: createDto.model 
        }
      );
    } catch (err) {
      console.error('Failed to notify admins:', err);
    }

    return savedRequest;
  }

  async findAll() {
    return this.purchaseRequestRepository.find({
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async findByUser(userId: string) {
    return this.purchaseRequestRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const request = await this.purchaseRequestRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!request) throw new NotFoundException('Purchase request not found');
    return request;
  }

  async updateStatus(id: string, updateDto: UpdatePurchaseRequestStatusDto) {
    const request = await this.findOne(id);
    request.status = updateDto.status;
    return this.purchaseRequestRepository.save(request);
  }

  async remove(id: string) {
    const request = await this.findOne(id);
    return this.purchaseRequestRepository.remove(request);
  }
}
