import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { UserRole } from '../../../common/enums';
import { Rental } from '../../reservations/entities/rental.entity';
import { Sale } from '../../sales/entities/sale.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Review } from '../../reviews/entities/review.entity';
import { UserDocument } from './user-document.entity';
import { PurchaseRequest } from '../../purchase-requests/entities/purchase-request.entity';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ select: false })
  password_hash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
  })
  role: UserRole;

  @Column({ nullable: true })
  license_number: string;

  @Column({ type: 'varchar', nullable: true, select: false })
  reset_password_token: string | null;

  @Column({ type: 'timestamp', nullable: true, select: false })
  reset_password_expires: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Rental, (rental) => rental.customer)
  rentals: Rental[];

  @OneToMany(() => Rental, (rental) => rental.driver)
  driven_rentals: Rental[];

  @OneToMany(() => Sale, (sale) => sale.customer)
  purchases: Sale[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToMany(() => UserDocument, (doc) => doc.user)
  documents: UserDocument[];

  @OneToMany(() => PurchaseRequest, (pr) => pr.user)
  purchaseRequests: PurchaseRequest[];
}
