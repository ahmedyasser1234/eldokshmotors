import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { VehicleStatus, VehicleCategory } from '../../../common/enums';
import { Rental } from '../../reservations/entities/rental.entity';
import { Sale } from '../../sales/entities/sale.entity';
import { Review } from '../../reviews/entities/review.entity';
import { VehicleMaintenance } from '../../maintenance/entities/maintenance.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  purchase_request_id: string;

  @Column({ nullable: true })
  make_ar: string;

  @Column({ nullable: true })
  make_en: string;

  @Column({ nullable: true })
  model_ar: string;

  @Column({ nullable: true })
  model_en: string;

  @Column()
  year: number;

  @Column({
    type: 'enum',
    enum: VehicleCategory,
  })
  category: VehicleCategory;

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.AVAILABLE,
  })
  status: VehicleStatus;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  rent_price_per_day: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  sale_price: number;

  @Column({ type: 'text', nullable: true })
  description_ar: string;

  @Column({ type: 'text', nullable: true })
  description_en: string;

  @Column('jsonb', { nullable: true })
  details: any;

  @Column('decimal', { precision: 12, scale: 2, nullable: true })
  reservation_price: number;

  @Column('jsonb', { nullable: true })
  installment_info: {
    down_payment: number;
    months: number;
    monthly_payment: number;
    interest_rate: number;
    total_amount: number;
  };

  @Column('text', { array: true, default: [] })
  image_urls: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Rental, (rental) => rental.vehicle)
  rentals: Rental[];

  @OneToMany(() => Sale, (sale) => sale.vehicle)
  sales: Sale[];

  @OneToMany(() => Review, (review) => review.vehicle)
  reviews: Review[];

  @OneToMany(() => VehicleMaintenance, (m) => m.vehicle)
  maintenances: VehicleMaintenance[];
}
