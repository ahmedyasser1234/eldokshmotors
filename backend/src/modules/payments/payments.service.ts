import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentStatus } from '../../common/enums';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const StripeSDK = require('stripe');

@Injectable()
export class PaymentsService {
  private stripe: any;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    // Stripe v16+ exports the class directly via CJS 
    const StripeConstructor = typeof StripeSDK === 'function' ? StripeSDK : StripeSDK.default;
    this.stripe = new StripeConstructor(secretKey);
  }

  async createCheckoutSession(amount: number, vehicleId: string, vehicleName: string) {
    if (!amount || amount <= 0) {
      amount = 1000;
    }
    const cappedAmountPiastres = Math.min(Math.round(amount * 100), 99999900);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'egp',
            product_data: {
              name: vehicleName || 'Car Reservation',
            },
            unit_amount: cappedAmountPiastres,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/payment-success?vehicleId=${vehicleId}&amount=${amount}`,
      cancel_url: `${frontendUrl}/checkout/${vehicleId}`,
    });

    return {
      url: session.url,
    };
  }

  async createPaymentIntent(amount: number) {
    if (!amount || amount <= 0) {
      amount = 1000; // Default fallback to prevent crash
    }
    // Cap amount for Stripe transaction limit in EGP (Max 999,999.00 EGP)
    const cappedAmountPiastres = Math.min(Math.round(amount * 100), 99999900);
    
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: cappedAmountPiastres,
      currency: 'egp',
      payment_method_types: ['card'], // card only = no redirects, fully inline
    });

    return {
      clientSecret: paymentIntent.client_secret,
    };
  }

  async findAll() {
    return this.paymentRepository.find({ relations: ['user'] });
  }

  async findByUser(userId: string) {
    return this.paymentRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string) {
    const payment = await this.paymentRepository.findOne({ 
      where: { id },
      relations: ['user']
    });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async create(data: any) {
    const payment = this.paymentRepository.create({
        ...data,
        payment_status: PaymentStatus.PENDING,
        transaction_id: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    });
    return this.paymentRepository.save(payment);
  }

  async updateStatus(id: string, status: PaymentStatus) {
    await this.paymentRepository.update(id, { payment_status: status });
    return this.findOne(id);
  }
}
