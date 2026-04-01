import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon, DiscountType } from './entities/coupon.entity';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
  ) {}

  async findAll() {
    return this.couponRepository.find();
  }

  async findOne(id: string) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async create(data: any) {
    const coupon = this.couponRepository.create(data);
    return this.couponRepository.save(coupon);
  }

  async validateCoupon(code: string, amount: number) {
    const coupon = await this.couponRepository.findOne({ where: { code, is_active: true } });
    if (!coupon) throw new NotFoundException('Invalid or inactive coupon');

    if (new Date() > coupon.expires_at) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.usage_limit > 0 && coupon.used_count >= coupon.usage_limit) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    let discount = 0;
    if (coupon.discount_type === DiscountType.PERCENTAGE) {
      discount = (amount * coupon.discount_value) / 100;
    } else {
      discount = coupon.discount_value;
    }

    return {
      discount: parseFloat(discount.toFixed(2)),
      finalAmount: parseFloat((amount - discount).toFixed(2)),
      couponId: coupon.id,
    };
  }

  async incrementUsage(id: string) {
    const coupon = await this.findOne(id);
    coupon.used_count += 1;
    return this.couponRepository.save(coupon);
  }

  async remove(id: string) {
    await this.couponRepository.delete(id);
  }
}
