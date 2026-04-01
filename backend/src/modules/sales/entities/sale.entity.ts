import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { SaleStatus } from '../../../common/enums';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.purchases)
  customer: User;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.sales)
  vehicle: Vehicle;

  @CreateDateColumn()
  sale_date: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  final_price: number;

  @Column({
    type: 'enum',
    enum: SaleStatus,
    default: SaleStatus.PENDING,
  })
  status: SaleStatus;

  @Column({ nullable: true })
  payment_method: string;

  @Column({ nullable: true })
  receipt_url: string;
}
