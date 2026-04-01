import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum AddonPricingType {
  PER_DAY = 'per_day',
  FLAT_FEE = 'flat_fee',
}

@Entity('addons')
export class Addon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: AddonPricingType,
    default: AddonPricingType.FLAT_FEE,
  })
  pricing_type: AddonPricingType;
}
