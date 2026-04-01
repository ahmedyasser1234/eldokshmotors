export interface PricingStrategy {
  calculate(basePrice: number): number;
}

export class RegularPricingStrategy implements PricingStrategy {
  calculate(basePrice: number) { return basePrice; }
}

export class WeekendPricingStrategy implements PricingStrategy {
  calculate(basePrice: number) { return basePrice * 1.25; } // 25% increase
}

export class SeasonalPricingStrategy implements PricingStrategy {
  constructor(private multiplier: number) {}
  calculate(basePrice: number) { return basePrice * this.multiplier; }
}

export class LongTermDiscountStrategy implements PricingStrategy {
  calculate(basePrice: number) { return basePrice * 0.85; } // 15% discount
}

export class PricingEngine {
  private strategy: PricingStrategy = new RegularPricingStrategy();

  setStrategy(strategy: PricingStrategy) {
    this.strategy = strategy;
  }

  calculate(basePrice: number) {
    return this.strategy.calculate(basePrice);
  }
}
