import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Addon } from './entities/addon.entity';

@Injectable()
export class AddonsService {
  constructor(
    @InjectRepository(Addon)
    private addonRepository: Repository<Addon>,
  ) {}

  async findAll() {
    return this.addonRepository.find();
  }

  async findOne(id: string) {
    const addon = await this.addonRepository.findOne({ where: { id } });
    if (!addon) throw new NotFoundException('Addon not found');
    return addon;
  }

  async create(data: any) {
    const addon = this.addonRepository.create(data);
    return this.addonRepository.save(addon);
  }

  async update(id: string, data: any) {
    await this.addonRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.addonRepository.delete(id);
  }
}
