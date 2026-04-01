import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { Location } from '../../locations/entities/location.entity';
import { RentalStatus } from '../../../common/enums';
import { RentalAddon } from './rental-addon.entity';

@Entity('rentals')
export class Rental {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.rentals)
  customer: User;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.rentals)
  vehicle: Vehicle;

  @ManyToOne(() => User, (user) => user.driven_rentals, { nullable: true })
  driver: User;

  @ManyToOne(() => Location)
  pickup_location: Location;

  @ManyToOne(() => Location)
  dropoff_location: Location;

  @Column()
  start_date: Date;

  @Column()
  end_date: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  total_price: number;

  @Column({
    type: 'enum',
    enum: RentalStatus,
    default: RentalStatus.PENDING,
  })
  status: RentalStatus;

  @OneToMany(() => RentalAddon, (ra) => ra.rental)
  addons: RentalAddon[];

  @CreateDateColumn()
  created_at: Date;
}
