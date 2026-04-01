import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleMaintenance } from './entities/maintenance.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { VehicleStatus } from '../../common/enums';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(VehicleMaintenance)
    private maintenanceRepository: Repository<VehicleMaintenance>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
  ) {}

  async create(data: any) {
    const maintenance = this.maintenanceRepository.create(data);
    const saved = await this.maintenanceRepository.save(maintenance);
    
    // Set vehicle to maintenance status
    await this.vehicleRepository.update(data.vehicle.id, { status: VehicleStatus.MAINTENANCE });
    
    return saved;
  }

  async findAll() {
    return this.maintenanceRepository.find({ relations: ['vehicle'] });
  }

  async completeMaintenance(id: string) {
    const maintenance = await this.maintenanceRepository.findOne({ 
      where: { id },
      relations: ['vehicle']
    });
    if (!maintenance) throw new NotFoundException('Maintenance record not found');

    maintenance.status = 'completed' as any; // Using string or enum
    maintenance.end_date = new Date();
    await this.maintenanceRepository.save(maintenance);

    // Set vehicle back to available
    await this.vehicleRepository.update(maintenance.vehicle.id, { status: VehicleStatus.AVAILABLE });

    return maintenance;
  }
}
