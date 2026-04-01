import { Rental } from './entities/rental.entity';
import { User } from '../users/entities/user.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Location } from '../locations/entities/location.entity';
import { RentalAddon } from './entities/rental-addon.entity';

export class ReservationBuilder {
  private rental: Partial<Rental> = {};
  private addons: Partial<RentalAddon>[] = [];

  constructor() {
    this.rental = new Rental();
  }

  setVehicle(vehicle: Vehicle): this {
    this.rental.vehicle = vehicle;
    return this;
  }

  setCustomer(customer: User): this {
    this.rental.customer = customer;
    return this;
  }

  setDates(startDate: Date, endDate: Date): this {
    this.rental.start_date = startDate;
    this.rental.end_date = endDate;
    return this;
  }

  setLocations(pickup: Location, dropoff: Location): this {
    this.rental.pickup_location = pickup;
    this.rental.dropoff_location = dropoff;
    return this;
  }

  setDriver(driver: User): this {
    this.rental.driver = driver;
    return this;
  }

  addAddon(addonId: string, price: number): this {
    this.addons.push({
        rental: this.rental as Rental,
        addon: { id: addonId } as any,
        price_at_booking: price
    });
    return this;
  }

  setTotalPrice(totalPrice: number): this {
    this.rental.total_price = totalPrice;
    return this;
  }

  build(): Rental {
    const rental = this.rental as Rental;
    rental.addons = this.addons as RentalAddon[];
    return rental;
  }
}
