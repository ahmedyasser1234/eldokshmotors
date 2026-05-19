import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InstallmentAgreement } from './installment-agreement.entity';

@Entity('installment_payments')
export class InstallmentPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'agreement_id' })
  agreementId: string;

  @ManyToOne(() => InstallmentAgreement, (agreement) => agreement.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'agreement_id' })
  agreement: InstallmentAgreement;

  @Column({ type: 'integer' })
  installment_number: number;

  @Column({ type: 'date' })
  due_date: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0.00 })
  penalty_fee: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0.00 })
  paid_amount: number;

  @Column({ type: 'varchar', length: 30, default: 'unpaid' }) // 'unpaid' | 'paid' | 'late' | 'pending_verification'
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  payment_date: Date;

  @Column({ nullable: true })
  receipt_url: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
