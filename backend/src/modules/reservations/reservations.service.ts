import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rental } from './entities/rental.entity';
import { ReservationBuilder } from './reservation.builder';
import { AvailabilityService } from '../availability/availability.service';
import { PricingService } from '../pricing/pricing.service';
import { NotificationsService } from '../notifications/notifications.service';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { User } from '../users/entities/user.entity';
import { Location } from '../locations/entities/location.entity';
import { RentalStatus } from '../../common/enums';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Rental)
    private rentalRepository: Repository<Rental>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    private availabilityService: AvailabilityService,
    private pricingService: PricingService,
    private notificationsService: NotificationsService,
  ) {}

  async createReservation(data: {
    userId: string;
    vehicleId: string;
    startDate: Date;
    endDate: Date;
    pickupLocationId: string;
    dropoffLocationId: string;
    addons?: { id: string; price: number }[];
    driverId?: string;
  }) {
    const isAvailable = await this.availabilityService.checkAvailability(
      data.vehicleId,
      new Date(data.startDate),
      new Date(data.endDate),
    );

    if (!isAvailable) {
      throw new BadRequestException('Vehicle is not available for these dates');
    }

    const vehicle = await this.vehicleRepository.findOne({ where: { id: data.vehicleId } });
    const user = await this.userRepository.findOne({ where: { id: data.userId } });
    const pickup = await this.locationRepository.findOne({ where: { id: data.pickupLocationId } });
    const dropoff = await this.locationRepository.findOne({ where: { id: data.dropoffLocationId } });

    if (!vehicle || !user || !pickup || !dropoff) {
      throw new NotFoundException('One or more entities not found');
    }

    const days = Math.ceil(
      (new Date(data.endDate).getTime() - new Date(data.startDate).getTime()) / (1000 * 60 * 60 * 24),
    );

    const price = this.pricingService.calculateTotalPrice({
      basePrice: Number(vehicle.rent_price_per_day),
      days,
      isWeekend: false, // Simple logic for now
      isPeakSeason: false,
      hasLongTermDiscount: days >= 7,
    });

    const builder = new ReservationBuilder();
    builder
      .setCustomer(user)
      .setVehicle(vehicle)
      .setDates(new Date(data.startDate), new Date(data.endDate))
      .setLocations(pickup, dropoff)
      .setTotalPrice(price);

    if (data.driverId) {
      const driverUser = await this.userRepository.findOne({ where: { id: data.driverId } });
      if (driverUser) builder.setDriver(driverUser);
    }

    if (data.addons) {
      data.addons.forEach((a) => builder.addAddon(a.id, a.price));
    }

    const rental = builder.build();
    const saved = await this.rentalRepository.save(rental);

    await this.notificationsService.notify(
      'notifications.reservations.created.title',
      'notifications.reservations.created.message',
      user.id,
      { 
        make: vehicle.make_en || vehicle.make_ar, 
        model: vehicle.model_en || vehicle.model_ar 
      }
    );

    return saved;
  }

  async findAll() {
    return this.rentalRepository.find({ relations: ['customer', 'vehicle', 'pickup_location', 'dropoff_location'] });
  }

  async findOne(id: string) {
    const rental = await this.rentalRepository.findOne({
      where: { id },
      relations: ['customer', 'vehicle', 'pickup_location', 'dropoff_location', 'addons', 'addons.addon'],
    });
    if (!rental) throw new NotFoundException('Reservation not found');
    return rental;
  }

  async updateStatus(id: string, status: RentalStatus) {
    const rental = await this.findOne(id);
    rental.status = status;
    const updated = await this.rentalRepository.save(rental);

    await this.notificationsService.notify(
      'notifications.reservations.updated.title',
      'notifications.reservations.updated.message',
      rental.customer.id,
      { 
        status: status 
      }
    );

    return updated;
  }
}
