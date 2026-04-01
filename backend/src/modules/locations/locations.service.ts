import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  async findAll() {
    return this.locationRepository.find();
  }

  async findOne(id: string) {
    const location = await this.locationRepository.findOne({ where: { id } });
    if (!location) throw new NotFoundException('Location not found');
    return location;
  }

  async create(data: any) {
    const location = this.locationRepository.create(data);
    return this.locationRepository.save(location);
  }

  async update(id: string, data: any) {
    await this.locationRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.locationRepository.delete(id);
  }
}
