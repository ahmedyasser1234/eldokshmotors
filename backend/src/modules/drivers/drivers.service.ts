import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll() {
    return this.driverRepository.find({ relations: ['user'] });
  }

  async findOne(id: string) {
    const driver = await this.driverRepository.findOne({
      where: { id },
      relations: ['user', 'assignments'],
    });
    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }

  async updateAvailability(id: string, isAvailable: boolean) {
    const driver = await this.findOne(id);
    driver.is_available = isAvailable;
    return this.driverRepository.save(driver);
  }

  async createDriverProfile(userId: string, licenseNumber: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    
    // Ensure user has driver role
    if (user.role !== UserRole.DRIVER) {
      user.role = UserRole.DRIVER;
      await this.userRepository.save(user);
    }

    const driver = this.driverRepository.create({
      user_id: userId,
      license_number: licenseNumber,
    });
    return this.driverRepository.save(driver);
  }
}
