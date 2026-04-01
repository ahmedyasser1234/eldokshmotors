export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
  DRIVER = 'driver',
}

export enum VehicleStatus {
  AVAILABLE = 'available',
  RESERVED = 'reserved',
  RENTED = 'rented',
  MAINTENANCE = 'maintenance',
  SOLD = 'sold',
}

export enum VehicleCategory {
  ECONOMY = 'economy',
  LUXURY = 'luxury',
  SUV = 'suv',
  SPORT = 'sport',
  VAN = 'van',
}

export enum RentalStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum SaleStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  WALLET = 'wallet',
  CASH_DEPOSIT = 'cash_deposit',
  ONLINE = 'online',
  VODAFONE = 'vodafone',
  INSTAPAY = 'instapay',
  FAWRY = 'fawry',
  STRIPE = 'stripe',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PurchaseRequestStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  PURCHASED = 'purchased',
}

