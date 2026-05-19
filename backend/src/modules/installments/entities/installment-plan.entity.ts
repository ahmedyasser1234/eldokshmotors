import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';

@Entity('installment_plans')
export class InstallmentPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vehicle_id', nullable: true })
  vehicleId: string;

  @ManyToOne(() => Vehicle, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ type: 'varchar', length: 20, default: 'fixed' }) // 'fixed' or 'variable'
  interest_rate_type: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  interest_rate: number;

  @Column({ type: 'jsonb', nullable: true })
  variable_rates: { months: number; rate: number }[];

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 20.00 })
  min_down_payment_percentage: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  admin_fee_percentage: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  admin_fee_flat: number;

  @Column({ type: 'integer', array: true, default: '{}' })
  available_months: number[];

  @Column({ type: 'varchar', length: 20, default: 'flat' }) // 'flat' or 'reducing'
  calculation_method: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
