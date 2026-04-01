import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UsersModule } from 'src/modules/users/users.module';
import { VehiclesModule } from 'src/modules/vehicles/vehicles.module';
import { ReservationsModule } from 'src/modules/reservations/reservations.module';
import { SalesModule } from 'src/modules/sales/sales.module';
import { LocationsModule } from 'src/modules/locations/locations.module';
import { EnginesModule } from './engines/engines.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { AvailabilityModule } from './modules/availability/availability.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SearchModule } from './modules/search/search.module';
import { AddonsModule } from './modules/addons/addons.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { AdminModule } from 'src/modules/admin/admin.module';
import { PaymentsModule } from 'src/modules/payments/payments.module';
import { MediaModule } from './modules/media/media.module';
import { PurchaseRequestsModule } from './modules/purchase-requests/purchase-requests.module';
import { ChatModule } from './modules/chat/chat.module';

import { Driver } from './modules/drivers/entities/driver.entity';
import { User } from './modules/users/entities/user.entity';
import { Vehicle } from './modules/vehicles/entities/vehicle.entity';
import { Rental } from './modules/reservations/entities/rental.entity';
import { Sale } from './modules/sales/entities/sale.entity';
import { Payment } from './modules/payments/entities/payment.entity';
import { Location as LocationEntity } from './modules/locations/entities/location.entity';
import { Addon } from './modules/addons/entities/addon.entity';
import { RentalAddon } from './modules/reservations/entities/rental-addon.entity';
import { Notification } from './modules/notifications/entities/notification.entity';
import { Review } from './modules/reviews/entities/review.entity';
import { VehicleMaintenance } from './modules/maintenance/entities/maintenance.entity';
import { Coupon } from './modules/coupons/entities/coupon.entity';
import { UserDocument } from './modules/users/entities/user-document.entity';
import { SystemLog } from './modules/admin/entities/system-log.entity';
import { DriverAssignment } from './modules/reservations/entities/driver-assignment.entity';
import { PurchaseRequest } from './modules/purchase-requests/entities/purchase-request.entity';
import { Conversation } from './modules/chat/entities/conversation.entity';
import { ChatMessage } from './modules/chat/entities/chat-message.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 5432,
        username: configService.get<string>('DB_USER') || 'postgres',
        password: configService.get<string>('DB_PASS') || 'postgres',
        database: configService.get<string>('DB_NAME') || 'car_rental',
        entities: [
          User, Vehicle, Rental, Sale, Payment, LocationEntity,
          Addon, RentalAddon, Notification, Review, VehicleMaintenance,
          Coupon, UserDocument, SystemLog, Driver, DriverAssignment, PurchaseRequest,
          Conversation, ChatMessage
        ],
        synchronize: true, // Auto-create tables for dev
      }),
      inject: [ConfigService],
    }),
    CacheModule.register({ isGlobal: true }),
    AuthModule,
    UsersModule,
    VehiclesModule,
    ReservationsModule,
    SalesModule,
    LocationsModule,
    EnginesModule,
    DriversModule,
    PricingModule,
    AvailabilityModule,
    NotificationsModule,
    SearchModule,
    AddonsModule,
    ReviewsModule,
    CouponsModule,
    MaintenanceModule,
    AnalyticsModule,
    DocumentsModule,
    AdminModule,
    PaymentsModule,
    MediaModule,
    PurchaseRequestsModule,
    ChatModule,
  ],
})
export class AppModule {}
