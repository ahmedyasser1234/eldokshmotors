import { Rental } from '../reservations/entities/rental.entity';

export interface ReservationObserver {
  onStatusChange(rental: Rental): void;
}

export class NotificationServiceObserver implements ReservationObserver {
  onStatusChange(rental: Rental) {
    console.log(`Sending notification to user ${rental.customer.id}: Reservation ${rental.status}`);
  }
}

export class DriverServiceObserver implements ReservationObserver {
  onStatusChange(rental: Rental) {
    if (rental.driver) {
      console.log(`Notifying driver ${rental.driver.id} about rental update`);
    }
  }
}

export class AdminServiceObserver implements ReservationObserver {
  onStatusChange(rental: Rental) {
    console.log(`Logging admin alert for reservation ${rental.id}`);
  }
}

export class ReservationSubject {
  private observers: ReservationObserver[] = [];

  attach(observer: ReservationObserver) {
    this.observers.push(observer);
  }

  detach(observer: ReservationObserver) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  notify(rental: Rental) {
    for (const observer of this.observers) {
      observer.onStatusChange(rental);
    }
  }
}
