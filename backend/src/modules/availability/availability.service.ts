import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Rental } from '../reservations/entities/rental.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { VehicleStatus } from '../../common/enums';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Rental)
    private rentalRepository: Repository<Rental>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async checkAvailability(vehicleId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const vehicle = await this.vehicleRepository.findOne({ where: { id: vehicleId } });
    if (!vehicle || vehicle.status === VehicleStatus.MAINTENANCE || vehicle.status === VehicleStatus.SOLD) {
      return false;
    }

    const conflictingRental = await this.rentalRepository.findOne({
      where: [
        {
          vehicle: { id: vehicleId },
          start_date: LessThanOrEqual(endDate),
          end_date: MoreThanOrEqual(startDate),
        }
      ],
    });

    return !conflictingRental;
  }
}
