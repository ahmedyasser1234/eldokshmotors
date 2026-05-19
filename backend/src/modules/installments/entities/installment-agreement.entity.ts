import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { InstallmentPayment } from './installment-payment.entity';

@Entity('installment_agreements')
export class InstallmentAgreement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'customer_id' })
  customerId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ name: 'vehicle_id' })
  vehicleId: string;

  @ManyToOne(() => Vehicle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @Column({ type: 'varchar', length: 30, default: 'pending_review' })
  // 'pending_review' | 'approved' | 'rejected' | 'active' | 'completed' | 'defaulted'
  status: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_price: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  down_payment: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  financed_amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interest_rate: number;

  @Column({ type: 'integer' })
  months: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monthly_payment: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0.00 })
  admin_fee: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_interest: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_agreement_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  remaining_balance: number;

  @Column({ type: 'varchar', length: 20, default: 'flat' }) // 'flat' or 'reducing'
  calculation_method: string;

  @Column({ type: 'date', nullable: true })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date: Date;

  @Column()
  client_name: string;

  @Column()
  client_phone: string;

  @Column()
  client_email: string;

  @Column({ nullable: true })
  client_job: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  client_monthly_income: number;

  @Column({ nullable: true })
  national_id_url: string;

  @Column({ nullable: true })
  income_proof_url: string;

  @OneToMany(() => InstallmentPayment, (payment) => payment.agreement, { cascade: true })
  payments: InstallmentPayment[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
