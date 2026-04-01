import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityEngine } from './availability.engine';
import { PricingEngine } from './pricing.engine';
import { Rental } from '../modules/reservations/entities/rental.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Rental])],
  providers: [AvailabilityEngine, PricingEngine],
  exports: [AvailabilityEngine, PricingEngine],
})
export class EnginesModule {}
