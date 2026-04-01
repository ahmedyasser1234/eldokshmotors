export interface PaymentStrategy {
  process(amount: number): Promise<{ success: boolean; transactionId: string }>;
}

export class StripeStrategy implements PaymentStrategy {
  async process(amount: number) {
    console.log(`Processing $${amount} via Stripe...`);
    return { success: true, transactionId: `stp_${Math.random().toString(36).substr(2, 9)}` };
  }
}

export class PayPalStrategy implements PaymentStrategy {
  async process(amount: number) {
    console.log(`Processing $${amount} via PayPal...`);
    return { success: true, transactionId: `ppl_${Math.random().toString(36).substr(2, 9)}` };
  }
}

export class WalletStrategy implements PaymentStrategy {
  async process(amount: number) {
    console.log(`Processing $${amount} via User Wallet...`);
    return { success: true, transactionId: `wlt_${Math.random().toString(36).substr(2, 9)}` };
  }
}

export class PaymentContext {
  private strategy: PaymentStrategy;

  constructor(strategy: PaymentStrategy) {
    this.strategy = strategy;
  }

  async executePayment(amount: number) {
    return this.strategy.process(amount);
  }
}
