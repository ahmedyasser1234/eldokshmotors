import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { PurchaseRequestStatus } from '../../../common/enums';
import { User } from '../../users/entities/user.entity';

@Entity('purchase_requests')
export class PurchaseRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column()
  mileage: number;

  @Column({ nullable: true })
  condition: string;

  @Column('decimal', { precision: 12, scale: 2 })
  expected_price: number;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { array: true, default: [] })
  image_urls: string[];

  @Column({ nullable: true })
  engine_size: string;

  @Column({ nullable: true })
  transmission: string;

  @Column({ nullable: true })
  fuel_type: string;

  @Column({ nullable: true })
  exterior_color: string;

  @Column({ nullable: true })
  interior_color: string;

  @Column({ nullable: true })
  vin: string;

  @Column({ nullable: true })
  location: string;

  @Column('text', { nullable: true })
  address: string;

  @Column({
    type: 'enum',
    enum: PurchaseRequestStatus,
    default: PurchaseRequestStatus.PENDING,
  })
  status: PurchaseRequestStatus;
  
  @Column({ nullable: true })
  client_name: string;

  @Column({ nullable: true })
  client_phone: string;

  @Column({ nullable: true })
  client_email: string;

  @ManyToOne(() => User, (user) => user.purchaseRequests, { nullable: true })
  user: User;

  @CreateDateColumn()
  created_at: Date;
}
