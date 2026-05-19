import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstallmentsService } from './installments.service';
import { InstallmentsController } from './installments.controller';
import { InstallmentPlan } from './entities/installment-plan.entity';
import { InstallmentAgreement } from './entities/installment-agreement.entity';
import { InstallmentPayment } from './entities/installment-payment.entity';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InstallmentPlan,
      InstallmentAgreement,
      InstallmentPayment,
    ]),
    VehiclesModule,
    NotificationsModule,
  ],
  controllers: [InstallmentsController],
  providers: [InstallmentsService],
  exports: [InstallmentsService],
})
export class InstallmentsModule {}
