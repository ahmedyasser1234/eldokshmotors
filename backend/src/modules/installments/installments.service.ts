import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { InstallmentPlan } from './entities/installment-plan.entity';
import { InstallmentAgreement } from './entities/installment-agreement.entity';
import { InstallmentPayment } from './entities/installment-payment.entity';
import { VehiclesService } from '../vehicles/vehicles.service';
import { NotificationsService } from '../notifications/notifications.service';
import { VehicleStatus } from '../../common/enums';

@Injectable()
export class InstallmentsService {
  constructor(
    @InjectRepository(InstallmentPlan)
    private planRepo: Repository<InstallmentPlan>,
    @InjectRepository(InstallmentAgreement)
    private agreementRepo: Repository<InstallmentAgreement>,
    @InjectRepository(InstallmentPayment)
    private paymentRepo: Repository<InstallmentPayment>,
    private vehiclesService: VehiclesService,
    private notificationsService: NotificationsService,
  ) {}

  // ==========================================
  // CALCULATIONS ENGINE
  // ==========================================

  calculateTerms(price: number, downPayment: number, months: number, annualRate: number, method: string) {
    const financedAmount = price - downPayment;
    if (financedAmount <= 0) {
      throw new BadRequestException('Down payment cannot be greater than or equal to vehicle price.');
    }

    let monthlyPayment = 0;
    let totalInterest = 0;

    if (method === 'reducing') {
      const monthlyRate = (annualRate / 100) / 12;
      if (monthlyRate === 0) {
        monthlyPayment = financedAmount / months;
      } else {
        monthlyPayment = financedAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
      }
      monthlyPayment = Math.round((monthlyPayment + Number.EPSILON) * 100) / 100;
      totalInterest = (monthlyPayment * months) - financedAmount;
      totalInterest = Math.round((totalInterest + Number.EPSILON) * 100) / 100;
    } else {
      // Flat interest rate calculation
      totalInterest = financedAmount * (annualRate / 100) * (months / 12);
      totalInterest = Math.round((totalInterest + Number.EPSILON) * 100) / 100;
      const totalRepayment = financedAmount + totalInterest;
      monthlyPayment = Math.round((totalRepayment / months + Number.EPSILON) * 100) / 100;
    }

    const totalAgreementAmount = downPayment + financedAmount + totalInterest;

    return {
      financedAmount,
      monthlyPayment,
      totalInterest,
      totalAgreementAmount,
    };
  }

  // ==========================================
  // CONFIGURATIONS (PLANS)
  // ==========================================

  async getPlanForVehicle(vehicleId: string): Promise<InstallmentPlan> {
    // 1. Try vehicle-specific plan
    let plan = await this.planRepo.findOne({
      where: { vehicleId, is_active: true },
    });

    // 2. Fallback to global plan (vehicleId is null)
    if (!plan) {
      plan = await this.planRepo.findOne({
        where: { vehicleId: IsNull(), is_active: true },
      });
    }

    // 3. Fallback to hardcoded safe defaults if none exist
    if (!plan) {
      plan = this.planRepo.create({
        interest_rate_type: 'fixed',
        interest_rate: 10,
        min_down_payment_percentage: 20,
        admin_fee_percentage: 1.5,
        admin_fee_flat: 0,
        available_months: [12, 24, 36, 48, 60],
        calculation_method: 'flat',
        is_active: true,
      });
    }

    return plan;
  }

  async savePlan(data: any): Promise<InstallmentPlan> {
    if (data.id) {
      const existing = await this.planRepo.findOne({ where: { id: data.id } });
      if (!existing) throw new NotFoundException('Configuration plan not found.');
      Object.assign(existing, data);
      return this.planRepo.save(existing);
    }
    const newPlan = this.planRepo.create(data as any);
    return this.planRepo.save(newPlan as any);
  }

  async getPlans(): Promise<InstallmentPlan[]> {
    return this.planRepo.find({ order: { created_at: 'DESC' } });
  }

  async deletePlan(id: string): Promise<void> {
    await this.planRepo.delete(id);
  }

  // ==========================================
  // AGREEMENTS (CONTRACTS)
  // ==========================================

  async apply(customerId: string, data: any): Promise<InstallmentAgreement> {
    const vehicle = await this.vehiclesService.findOne(data.vehicleId);
    if (!vehicle) throw new NotFoundException('Vehicle not found.');

    const plan = await this.getPlanForVehicle(data.vehicleId);

    // Validate down payment
    const minDownPayment = vehicle.sale_price * (plan.min_down_payment_percentage / 100);
    if (data.downPayment < minDownPayment) {
      throw new BadRequestException(`Down payment must be at least ${minDownPayment} EGP (${plan.min_down_payment_percentage}%).`);
    }

    // Validate months
    if (!plan.available_months.includes(Number(data.months))) {
      throw new BadRequestException(`Selected duration ${data.months} is not allowed for this vehicle.`);
    }

    // Resolve Interest Rate
    let interestRate = plan.interest_rate;
    if (plan.interest_rate_type === 'variable' && plan.variable_rates) {
      const match = plan.variable_rates.find((v) => Number(v.months) === Number(data.months));
      if (match) interestRate = match.rate;
    }

    // Calculate admin fee
    const adminFee = (vehicle.sale_price * (plan.admin_fee_percentage / 100)) + Number(plan.admin_fee_flat || 0);

    // Perform terms calculations
    const terms = this.calculateTerms(
      vehicle.sale_price,
      data.downPayment,
      data.months,
      interestRate,
      plan.calculation_method,
    );

    const agreement = this.agreementRepo.create({
      customerId,
      vehicleId: data.vehicleId,
      status: 'pending_review',
      total_price: vehicle.sale_price,
      down_payment: data.downPayment,
      financed_amount: terms.financedAmount,
      interest_rate: interestRate,
      months: data.months,
      monthly_payment: terms.monthlyPayment,
      admin_fee: adminFee,
      total_interest: terms.totalInterest,
      total_agreement_amount: terms.totalAgreementAmount + adminFee,
      remaining_balance: terms.financedAmount + terms.totalInterest,
      calculation_method: plan.calculation_method,
      client_name: data.clientName,
      client_phone: data.clientPhone,
      client_email: data.clientEmail,
      client_job: data.clientJob,
      client_monthly_income: data.clientMonthlyIncome,
      national_id_url: data.nationalIdUrl,
      income_proof_url: data.incomeProofUrl,
    });

    const saved = await this.agreementRepo.save(agreement);

    // Notify admins of new request
    // We fetch a list of administrators or notify default admin channels
    // For now we'll trigger a notification to the system (user notification handles broadcast to socket and DB)
    await this.notificationsService.notify(
      'New Installment Application',
      `Customer ${data.clientName} has applied for financing on ${vehicle.make_en} ${vehicle.model_en}.`,
      customerId, // For client context, or we can use admin notification
      { type: 'installment_request', agreementId: saved.id },
    );

    return saved;
  }

  async findAllAgreements(filters: any = {}): Promise<InstallmentAgreement[]> {
    const query = this.agreementRepo.createQueryBuilder('agreement')
      .leftJoinAndSelect('agreement.customer', 'customer')
      .leftJoinAndSelect('agreement.vehicle', 'vehicle')
      .orderBy('agreement.created_at', 'DESC');

    if (filters.status) {
      query.andWhere('agreement.status = :status', { status: filters.status });
    }
    if (filters.customerId) {
      query.andWhere('agreement.customerId = :customerId', { customerId: filters.customerId });
    }
    if (filters.vehicleId) {
      query.andWhere('agreement.vehicleId = :vehicleId', { vehicleId: filters.vehicleId });
    }

    return query.getMany();
  }

  async findMyAgreements(customerId: string): Promise<InstallmentAgreement[]> {
    return this.agreementRepo.find({
      where: { customerId },
      relations: ['vehicle'],
      order: { created_at: 'DESC' },
    });
  }

  async findOneAgreement(id: string): Promise<InstallmentAgreement> {
    const agreement = await this.agreementRepo.findOne({
      where: { id },
      relations: ['customer', 'vehicle', 'payments'],
    });
    if (!agreement) throw new NotFoundException('Agreement not found.');
    // Sort payments by installment number
    if (agreement.payments) {
      agreement.payments.sort((a, b) => a.installment_number - b.installment_number);
    }
    return agreement;
  }

  async updateAgreementStatus(id: string, status: string): Promise<InstallmentAgreement> {
    const agreement = await this.findOneAgreement(id);

    if (status === 'approved') {
      agreement.status = 'active';
      agreement.start_date = new Date();
      
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + agreement.months);
      agreement.end_date = endDate;

      // Generate Amortization Schedule
      const payments: InstallmentPayment[] = [];
      for (let i = 1; i <= agreement.months; i++) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (30 * i));

        const payment = this.paymentRepo.create({
          installment_number: i,
          due_date: dueDate,
          amount: agreement.monthly_payment,
          penalty_fee: 0,
          paid_amount: 0,
          status: 'unpaid',
        });
        payments.push(payment);
      }
      agreement.payments = payments;

      // Update vehicle status
      await this.vehiclesService.update(agreement.vehicleId, { status: VehicleStatus.SOLD });

      // Notify customer
      await this.notificationsService.notify(
        'Installment Plan Approved',
        `Congratulations! Your installment plan for ${agreement.vehicle.make_en} has been approved.`,
        agreement.customerId,
        { type: 'installment_approved', agreementId: agreement.id },
      );
    } else if (status === 'rejected') {
      agreement.status = 'rejected';

      // Notify customer
      await this.notificationsService.notify(
        'Installment Plan Rejected',
        `We regret to inform you that your installment plan application for ${agreement.vehicle.make_en} was rejected.`,
        agreement.customerId,
        { type: 'installment_rejected', agreementId: agreement.id },
      );
    } else {
      agreement.status = status;
    }

    return this.agreementRepo.save(agreement);
  }

  // ==========================================
  // PAYMENTS & RECEIPT AUDITING
  // ==========================================

  async submitPaymentReceipt(paymentId: string, receiptUrl: string): Promise<InstallmentPayment> {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['agreement', 'agreement.vehicle', 'agreement.customer'],
    });
    if (!payment) throw new NotFoundException('Installment payment schedule not found.');

    payment.receipt_url = receiptUrl;
    payment.status = 'pending_verification';
    const saved = await this.paymentRepo.save(payment);

    // Notify admins
    await this.notificationsService.notify(
      'New Installment Receipt Uploaded',
      `User ${payment.agreement.client_name} uploaded a receipt for installment #${payment.installment_number}.`,
      payment.agreement.customerId, // Context user
      { type: 'installment_receipt', paymentId: payment.id, is_receipt: true },
    );

    return saved;
  }

  async verifyPayment(paymentId: string, data: { status: string; notes?: string; penalty?: number }): Promise<InstallmentPayment> {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['agreement', 'agreement.vehicle'],
    });
    if (!payment) throw new NotFoundException('Payment not found.');

    if (data.penalty !== undefined) {
      payment.penalty_fee = data.penalty;
    }

    if (data.status === 'paid') {
      payment.status = 'paid';
      payment.payment_date = new Date();
      payment.paid_amount = Number(payment.amount) + Number(payment.penalty_fee);
      payment.notes = data.notes || payment.notes;

      // Update agreement remaining balance
      const agreement = payment.agreement;
      agreement.remaining_balance = Number(agreement.remaining_balance) - Number(payment.amount);
      if (agreement.remaining_balance < 0) agreement.remaining_balance = 0;

      // Check if all payments are paid
      const allPayments = await this.paymentRepo.find({ where: { agreementId: agreement.id } });
      const unpaidCount = allPayments.filter((p) => p.id !== paymentId && p.status !== 'paid').length;
      if (unpaidCount === 0) {
        agreement.status = 'completed';
      }

      await this.agreementRepo.save(agreement);

      // Notify customer
      await this.notificationsService.notify(
        'Installment Payment Approved',
        `Your payment for installment #${payment.installment_number} of ${agreement.vehicle.make_en} has been verified.`,
        agreement.customerId,
        { type: 'payment_verified', paymentId: payment.id },
      );
    } else if (data.status === 'unpaid') {
      payment.status = 'unpaid';
      payment.receipt_url = '' as any;
      payment.notes = data.notes || payment.notes;

      // Notify customer
      await this.notificationsService.notify(
        'Installment Payment Rejected',
        `Your payment receipt for installment #${payment.installment_number} was rejected. Please upload a valid proof.`,
        payment.agreement.customerId,
        { type: 'payment_rejected', paymentId: payment.id },
      );
    }

    return this.paymentRepo.save(payment);
  }

  async recordManualPayment(paymentId: string, adminNotes: string): Promise<InstallmentPayment> {
    return this.verifyPayment(paymentId, { status: 'paid', notes: adminNotes });
  }

  // ==========================================
  // CRON JOBS / REMINDERS LOGIC
  // ==========================================

  async runDailyPaymentChecks(): Promise<{ lateCount: number; notificationsSent: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const unpaidPayments = await this.paymentRepo.find({
      where: {
        status: Not('paid'),
      },
      relations: ['agreement', 'agreement.vehicle', 'agreement.customer'],
    });

    let lateCount = 0;
    let notificationsSent = 0;

    for (const payment of unpaidPayments) {
      const dueDate = new Date(payment.due_date);
      dueDate.setHours(0, 0, 0, 0);

      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 1. Mark as Late if past due date
      if (diffDays < 0 && payment.status !== 'late' && payment.status !== 'pending_verification') {
        payment.status = 'late';
        await this.paymentRepo.save(payment);
        lateCount++;

        // Update agreement status if needed
        if (payment.agreement.status === 'active') {
          payment.agreement.status = 'defaulted';
          await this.agreementRepo.save(payment.agreement);
        }

        // Notify client
        await this.notificationsService.notify(
          'Installment Overdue Alert!',
          `Warning: Your installment #${payment.installment_number} for ${payment.agreement.vehicle.make_en} is overdue by ${Math.abs(diffDays)} days.`,
          payment.agreement.customerId,
          { type: 'installment_late', paymentId: payment.id },
        );
        notificationsSent++;
      }

      // 2. Reminders: 7 days, 3 days, and due day
      if (diffDays === 7) {
        await this.notificationsService.notify(
          'Installment Due in 7 Days',
          `Reminder: Your monthly payment of ${payment.amount} EGP is due on ${payment.due_date}.`,
          payment.agreement.customerId,
          { type: 'installment_reminder', paymentId: payment.id },
        );
        notificationsSent++;
      } else if (diffDays === 3) {
        await this.notificationsService.notify(
          'Installment Due in 3 Days',
          `Reminder: Your monthly payment of ${payment.amount} EGP is due in 3 days on ${payment.due_date}.`,
          payment.agreement.customerId,
          { type: 'installment_reminder', paymentId: payment.id },
        );
        notificationsSent++;
      } else if (diffDays === 0) {
        await this.notificationsService.notify(
          'Installment Due Today',
          `Urgent: Your installment payment of ${payment.amount} EGP is due today. Please complete payment.`,
          payment.agreement.customerId,
          { type: 'installment_reminder', paymentId: payment.id },
        );
        notificationsSent++;
      }
    }

    return { lateCount, notificationsSent };
  }

  // ==========================================
  // ANALYTICS & REPORTS
  // ==========================================

  async getAnalytics(): Promise<any> {
    const agreements = await this.agreementRepo.find({
      relations: ['payments'],
    });

    const activeAgreements = agreements.filter((a) => a.status === 'active' || a.status === 'defaulted');

    const totalFinanced = activeAgreements.reduce((sum, a) => sum + Number(a.financed_amount), 0);
    const totalProfits = activeAgreements.reduce((sum, a) => sum + Number(a.total_interest), 0);
    
    // Count defaulted users (currently defaulted status or has late payments)
    const defaultedClients = agreements.filter((a) => a.status === 'defaulted').length;

    // Get total payments paid vs due today vs late
    const payments = await this.paymentRepo.find({
      relations: ['agreement'],
    });

    const totalPaid = payments
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.paid_amount), 0);

    const outstandingBalance = activeAgreements.reduce((sum, a) => sum + Number(a.remaining_balance), 0);

    const lateCount = payments.filter((p) => p.status === 'late').length;

    // Build monthly collection chart data (paid payments grouped by month for the last 6 months)
    const collectionHistory: { [key: string]: number } = {};
    const interestHistory: { [key: string]: number } = {};

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    payments.forEach((p) => {
      if (p.status === 'paid' && p.payment_date) {
        const pDate = new Date(p.payment_date);
        if (pDate >= sixMonthsAgo) {
          const monthKey = pDate.toLocaleString('default', { month: 'short', year: '2-digit' });
          collectionHistory[monthKey] = (collectionHistory[monthKey] || 0) + Number(p.paid_amount);
          
          // Estimate interest profit per payment
          const interestPortion = Number(p.amount) * (Number(p.agreement.total_interest) / Number(p.agreement.financed_amount + p.agreement.total_interest));
          interestHistory[monthKey] = (interestHistory[monthKey] || 0) + interestPortion;
        }
      }
    });

    const chartData = Object.keys(collectionHistory).map((month) => ({
      month,
      collections: Math.round(collectionHistory[month]),
      profit: Math.round(interestHistory[month] || 0),
    }));

    return {
      totalFinanced,
      totalProfits,
      defaultedClients,
      totalPaid,
      outstandingBalance,
      lateCount,
      activeAgreementsCount: activeAgreements.length,
      chartData,
    };
  }
}
