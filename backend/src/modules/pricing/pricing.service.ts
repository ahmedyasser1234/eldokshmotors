import { Injectable } from '@nestjs/common';
import { 
  PricingContext, 
  BasePricingStrategy, 
  WeekendPricingStrategy, 
  SeasonalPricingStrategy, 
  LongTermDiscountStrategy 
} from './pricing.strategies';

@Injectable()
export class PricingService {
  calculateTotalPrice(context: PricingContext): number {
    const strategies = [
      new BasePricingStrategy(),
      new WeekendPricingStrategy(),
      new SeasonalPricingStrategy(),
      new LongTermDiscountStrategy(),
    ];

    // Simple implementation: taking the highest price or applying multipliers
    // For this example, let's say we apply the most specific strategy or average
    // Better: chain them if they are multipliers, or pick the best one.
    
    let finalPrice = context.basePrice * context.days;
    
    if (context.isPeakSeason) {
        finalPrice *= 1.5;
    } else if (context.isWeekend) {
        finalPrice *= 1.2;
    }
    
    if (context.days >= 7) {
        finalPrice *= 0.9;
    }

    return parseFloat(finalPrice.toFixed(2));
  }
}
