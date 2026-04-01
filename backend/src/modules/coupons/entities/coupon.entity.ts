import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}

@Entity('coupons')
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  code: string;

  @Column({
    type: 'enum',
    enum: DiscountType,
    default: DiscountType.FIXED_AMOUNT,
  })
  discount_type: DiscountType;

  @Column('decimal', { precision: 10, scale: 2 })
  discount_value: number;

  @Column()
  expires_at: Date;

  @Column({ default: 0 })
  usage_limit: number;

  @Column({ default: 0 })
  used_count: number;

  @CreateDateColumn()
  created_at: Date;

  @Column({ default: true })
  is_active: boolean;
}
