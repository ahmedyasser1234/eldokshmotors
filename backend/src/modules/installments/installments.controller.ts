import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InstallmentsService } from './installments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums';

@Controller('installments')
export class InstallmentsController {
  constructor(private readonly installmentsService: InstallmentsService) {}

  // ==========================================
  // PLANS CONFIGURATION
  // ==========================================

  @Post('plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  savePlan(@Body() data: any) {
    return this.installmentsService.savePlan(data);
  }

  @Get('plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getPlans() {
    return this.installmentsService.getPlans();
  }

  @Delete('plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  deletePlan(@Param('id') id: string) {
    return this.installmentsService.deletePlan(id);
  }

  @Get('plans/vehicle/:vehicleId')
  getPlanForVehicle(@Param('vehicleId') vehicleId: string) {
    return this.installmentsService.getPlanForVehicle(vehicleId);
  }

  // ==========================================
  // AGREEMENTS / APPLICATIONS
  // ==========================================

  @Post('agreements')
  @UseGuards(JwtAuthGuard)
  apply(@GetUser() user: User, @Body() data: any) {
    return this.installmentsService.apply(user.id, data);
  }

  @Get('agreements')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAllAgreements(@Query() query: any) {
    return this.installmentsService.findAllAgreements(query);
  }

  @Get('agreements/my')
  @UseGuards(JwtAuthGuard)
  findMyAgreements(@GetUser() user: User) {
    return this.installmentsService.findMyAgreements(user.id);
  }

  @Get('agreements/:id')
  @UseGuards(JwtAuthGuard)
  findOneAgreement(@Param('id') id: string) {
    return this.installmentsService.findOneAgreement(id);
  }

  @Patch('agreements/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateAgreementStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.installmentsService.updateAgreementStatus(id, status);
  }

  // ==========================================
  // PAYMENTS
  // ==========================================

  @Post('payments/:paymentId/pay')
  @UseGuards(JwtAuthGuard)
  submitPaymentReceipt(@Param('paymentId') paymentId: string, @Body('receiptUrl') receiptUrl: string) {
    return this.installmentsService.submitPaymentReceipt(paymentId, receiptUrl);
  }

  @Post('payments/:paymentId/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  verifyPayment(
    @Param('paymentId') paymentId: string,
    @Body() body: { status: string; notes?: string; penalty?: number },
  ) {
    return this.installmentsService.verifyPayment(paymentId, body);
  }

  @Post('payments/:paymentId/manual')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  recordManualPayment(@Param('paymentId') paymentId: string, @Body('notes') notes: string) {
    return this.installmentsService.recordManualPayment(paymentId, notes);
  }

  // ==========================================
  // ANALYTICS & SCHEDULER
  // ==========================================

  @Get('analytics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getAnalytics() {
    return this.installmentsService.getAnalytics();
  }

  @Post('cron-trigger')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  triggerChecks() {
    return this.installmentsService.runDailyPaymentChecks();
  }
}
