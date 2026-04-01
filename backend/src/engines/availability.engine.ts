import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm';
import { Rental } from '../modules/reservations/entities/rental.entity';
import { RentalStatus } from '../common/enums';

@Injectable()
export class AvailabilityEngine {
  constructor(
    @InjectRepository(Rental)
    private rentalRepository: Repository<Rental>,
  ) {}

  async isVehicleAvailable(vehicleId: string, startDate: Date, endDate: Date): Promise<boolean> {
    const overlappingRental = await this.rentalRepository.findOne({
      where: [
        {
          vehicle: { id: vehicleId },
          status: Not(RentalStatus.CANCELLED),
          start_date: LessThanOrEqual(endDate),
          end_date: MoreThanOrEqual(startDate),
        },
      ],
    });

    return !overlappingRental;
  }
}
