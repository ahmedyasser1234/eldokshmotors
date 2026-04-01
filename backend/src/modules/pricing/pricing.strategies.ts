export interface PricingContext {
  basePrice: number;
  days: number;
  isWeekend: boolean;
  isPeakSeason: boolean;
  hasLongTermDiscount: boolean;
}

export interface PricingStrategy {
  calculate(context: PricingContext): number;
}

export class BasePricingStrategy implements PricingStrategy {
  calculate(context: PricingContext): number {
    return context.basePrice * context.days;
  }
}

export class WeekendPricingStrategy implements PricingStrategy {
  private readonly multiplier = 1.2; // 20% increase on weekends

  calculate(context: PricingContext): number {
    if (context.isWeekend) {
      return context.basePrice * context.days * this.multiplier;
    }
    return context.basePrice * context.days;
  }
}

export class SeasonalPricingStrategy implements PricingStrategy {
  private readonly multiplier = 1.5; // 50% increase in peak season

  calculate(context: PricingContext): number {
    if (context.isPeakSeason) {
      return context.basePrice * context.days * this.multiplier;
    }
    return context.basePrice * context.days;
  }
}

export class LongTermDiscountStrategy implements PricingStrategy {
  private readonly discount = 0.9; // 10% discount for long term

  calculate(context: PricingContext): number {
    if (context.days >= 7) {
      return context.basePrice * context.days * this.discount;
    }
    return context.basePrice * context.days;
  }
}
