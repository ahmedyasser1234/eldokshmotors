import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Rental } from './rental.entity';
import { Addon } from '../../addons/entities/addon.entity';

@Entity('rental_addons')
export class RentalAddon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Rental, (rental) => rental.addons)
  rental: Rental;

  @ManyToOne(() => Addon)
  addon: Addon;

  @Column('decimal', { precision: 10, scale: 2 })
  price_at_booking: number;
}
