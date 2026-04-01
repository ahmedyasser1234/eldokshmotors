import { Vehicle } from './entities/vehicle.entity';
import { VehicleCategory, VehicleStatus } from '../../common/enums';

export abstract class VehicleBase {
  abstract getType(): string;
  abstract getDetails(): any;
}

export class RentalCar extends VehicleBase {
  constructor(private vehicle: Vehicle) {
    super();
  }
  getType() { return 'rental'; }
  getDetails() {
    return {
      dailyRate: this.vehicle.rent_price_per_day,
      category: this.vehicle.category,
      status: this.vehicle.status,
    };
  }
}

export class CarForSale extends VehicleBase {
  constructor(private vehicle: Vehicle) {
    super();
  }
  getType() { return 'sale'; }
  getDetails() {
    return {
      price: this.vehicle.sale_price,
      year: this.vehicle.year,
      status: this.vehicle.status,
    };
  }
}

export class WeddingCar extends VehicleBase {
  constructor(private vehicle: Vehicle) {
    super();
  }
  getType() { return 'wedding'; }
  getDetails() {
    return {
      dailyRate: this.vehicle.rent_price_per_day,
      isDecorated: true,
      category: this.vehicle.category,
    };
  }
}

export class VehicleFactory {
  static create(vehicle: Vehicle): VehicleBase {
    if (vehicle.sale_price && !vehicle.rent_price_per_day) {
      return new CarForSale(vehicle);
    }
    
    // Logic for wedding cars could be based on a flag in details or a specific category
    if (vehicle.details?.isWeddingCar) {
      return new WeddingCar(vehicle);
    }

    return new RentalCar(vehicle);
  }
}
