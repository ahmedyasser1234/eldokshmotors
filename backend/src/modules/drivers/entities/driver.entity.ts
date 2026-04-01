import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { DriverAssignment } from '../../reservations/entities/driver-assignment.entity';

@Entity('drivers')
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  user_id: string;

  @Column()
  license_number: string;

  @Column({ default: true })
  is_available: boolean;

  @OneToMany(() => DriverAssignment, (assignment) => assignment.driver)
  assignments: DriverAssignment[];
}
