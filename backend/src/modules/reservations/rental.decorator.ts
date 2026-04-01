export interface RentalPrice {
  getPrice(): number;
  getDescription(): string;
}

export class BaseRentalPrice implements RentalPrice {
  constructor(private dailyPrice: number, private days: number) {}
  getPrice() { return this.dailyPrice * this.days; }
  getDescription() { return `Base rental for ${this.days} days`; }
}

export abstract class RentalDecorator implements RentalPrice {
  constructor(protected decoratedPrice: RentalPrice) {}
  abstract getPrice(): number;
  abstract getDescription(): string;
}

export class DriverDecorator extends RentalDecorator {
  constructor(decoratedPrice: RentalPrice, private fee: number) {
    super(decoratedPrice);
  }
  getPrice() { return this.decoratedPrice.getPrice() + this.fee; }
  getDescription() { return `${this.decoratedPrice.getDescription()} + Personal Driver`; }
}

export class ChildSeatDecorator extends RentalDecorator {
  constructor(decoratedPrice: RentalPrice, private fee: number) {
    super(decoratedPrice);
  }
  getPrice() { return this.decoratedPrice.getPrice() + this.fee; }
  getDescription() { return `${this.decoratedPrice.getDescription()} + Child Seat`; }
}

export class VIPDeliveryDecorator extends RentalDecorator {
  constructor(decoratedPrice: RentalPrice, private fee: number) {
    super(decoratedPrice);
  }
  getPrice() { return this.decoratedPrice.getPrice() + this.fee; }
  getDescription() { return `${this.decoratedPrice.getDescription()} + VIP Delivery`; }
}
