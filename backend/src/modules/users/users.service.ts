import { Injectable, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '../../common/enums';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedAdmin();
  }

  private async seedAdmin() {
    const adminEmail = 'admin@eldoksh.com';
    const existingAdmin = await this.userRepository.findOne({ where: { email: adminEmail } });

    if (!existingAdmin) {
      console.log('Seeding default admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = this.userRepository.create({
        name: 'Admin Eldoksh',
        email: adminEmail,
        password_hash: hashedPassword,
        role: UserRole.ADMIN,
        phone: '0123456789'
      });
      await this.userRepository.save(admin);
      console.log('Default admin user seeded successfully.');
    }
  }

  async findAll() {
    return this.userRepository.find();
  }

  async findAdmins() {
    return this.userRepository.find({ where: { role: UserRole.ADMIN } });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password_hash', 'role', 'name']
    });
  }

  async create(data: any) {
    const existing = await this.userRepository.findOne({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already exists');
    
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async update(id: string, data: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, ...updateData } = data;
    
    if (updateData.password) {
      const { password, ...rest } = updateData;
      const hashedPassword = await bcrypt.hash(password, 10);
      await this.userRepository.update(id, { ...rest, password_hash: hashedPassword });
    } else {
      await this.userRepository.update(id, updateData);
    }
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.userRepository.delete(id);
  }
}
