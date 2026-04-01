import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, PaymentStatus } from '../../common/enums';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get('my-payments')
  findByUser(@GetUser() user: User) {
    return this.paymentsService.findByUser(user.id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Post()
  create(@Body() data: any) {
    return this.paymentsService.create(data);
  }

  @Post('create-session')
  createSession(@Body() data: { amount: number; vehicleId: string; vehicleName: string }) {
    return this.paymentsService.createCheckoutSession(data.amount, data.vehicleId, data.vehicleName);
  }

  @Post('create-intent')
  createIntent(@Body() data: { amount: number }) {
    return this.paymentsService.createPaymentIntent(data.amount);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body('status') status: PaymentStatus) {
    return this.paymentsService.updateStatus(id, status);
  }
}
