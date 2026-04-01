import { Addon } from './entities/addon.entity';

export interface RentalPriceComponent {
  getPrice(): number;
  getDescription(): string;
}

export class BaseRentalPrice implements RentalPriceComponent {
  constructor(private basePrice: number, private days: number) {}

  getPrice(): number {
    return this.basePrice * this.days;
  }

  getDescription(): string {
    return `Base Rental (${this.days} days)`;
  }
}

export abstract class RentalAddonDecorator implements RentalPriceComponent {
  constructor(protected component: RentalPriceComponent, protected addon: Addon) {}

  abstract getPrice(): number;
  abstract getDescription(): string;
}

export class ExtraServiceDecorator extends RentalAddonDecorator {
  getPrice(): number {
    return this.component.getPrice() + Number(this.addon.price);
  }

  getDescription(): string {
    return `${this.component.getDescription()} + ${this.addon.name}`;
  }
}

export class DriverDecorator extends RentalAddonDecorator {
  private readonly driverFee = 50; // Example flat fee per day or total

  constructor(component: RentalPriceComponent, addon: Addon, private days: number) {
    super(component, addon);
  }

  getPrice(): number {
    return this.component.getPrice() + (this.driverFee * this.days);
  }

  getDescription(): string {
    return `${this.component.getDescription()} + Professional Driver`;
  }
}
