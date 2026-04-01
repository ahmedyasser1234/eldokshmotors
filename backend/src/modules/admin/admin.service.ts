import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemLog } from './entities/system-log.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(SystemLog)
    private systemLogRepository: Repository<SystemLog>,
  ) {}

  async createLog(action: string, details: string, userId?: string) {
    const log = this.systemLogRepository.create({
      action,
      details,
      user: userId ? { id: userId } : undefined,
    });
    return this.systemLogRepository.save(log);
  }

  async getLogs() {
    return this.systemLogRepository.find({
      relations: ['user'],
      order: { created_at: 'DESC' },
      take: 100,
    });
  }

  async getSystemStats() {
    // This could be expanded to return various system metrics
    return {
      status: 'healthy',
      version: '1.0.0',
      uptime: process.uptime(),
    };
  }
}
