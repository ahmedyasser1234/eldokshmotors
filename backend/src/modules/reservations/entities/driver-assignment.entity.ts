import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Rental } from './rental.entity';
import { User } from '../../users/entities/user.entity';

export enum DriverAssignmentStatus {
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

@Entity('driver_assignments')
export class DriverAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Rental)
  rental: Rental;

  @ManyToOne(() => User)
  driver: User;

  @Column({
    type: 'enum',
    enum: DriverAssignmentStatus,
    default: DriverAssignmentStatus.ASSIGNED,
  })
  status: DriverAssignmentStatus;

  @CreateDateColumn()
  assigned_at: Date;
}
