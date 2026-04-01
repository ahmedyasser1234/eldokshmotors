import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

@Entity('vehicle_maintenance')
export class VehicleMaintenance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Vehicle, (v) => v.maintenances)
  vehicle: Vehicle;

  @Column()
  start_date: Date;

  @Column({ nullable: true })
  end_date: Date;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  cost: number;

  @Column()
  status: string; // 'pending', 'in_progress', 'completed'
}
