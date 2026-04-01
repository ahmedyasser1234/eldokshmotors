import { VehicleStatus } from '../../common/enums';
import { Vehicle } from './entities/vehicle.entity';

export interface VehicleState {
  status: VehicleStatus;
  canRent(): boolean;
  canSell(): boolean;
  canMaintain(): boolean;
}

export class AvailableState implements VehicleState {
  status = VehicleStatus.AVAILABLE;
  canRent() { return true; }
  canSell() { return true; }
  canMaintain() { return true; }
}

export class RentedState implements VehicleState {
  status = VehicleStatus.RENTED;
  canRent() { return false; }
  canSell() { return false; }
  canMaintain() { return false; }
}

export class MaintenanceState implements VehicleState {
  status = VehicleStatus.MAINTENANCE;
  canRent() { return false; }
  canSell() { return false; }
  canMaintain() { return false; }
}

export class ReservedState implements VehicleState {
  status = VehicleStatus.RESERVED;
  canRent() { return true; } // Can transition to Rented
  canSell() { return false; }
  canMaintain() { return true; }
}

export class SoldState implements VehicleState {
  status = VehicleStatus.SOLD;
  canRent() { return false; }
  canSell() { return false; }
  canMaintain() { return false; }
}

export class VehicleStateManager {
  private state: VehicleState;

  constructor(private vehicle: Vehicle) {
    this.state = this.mapStatusToState(vehicle.status);
  }

  private mapStatusToState(status: VehicleStatus): VehicleState {
    switch (status) {
      case VehicleStatus.RENTED: return new RentedState();
      case VehicleStatus.MAINTENANCE: return new MaintenanceState();
      case VehicleStatus.RESERVED: return new ReservedState();
      case VehicleStatus.SOLD: return new SoldState();
      default: return new AvailableState();
    }
  }

  canRent() { return this.state.canRent(); }
  canSell() { return this.state.canSell(); }
  canMaintain() { return this.state.canMaintain(); }
}
