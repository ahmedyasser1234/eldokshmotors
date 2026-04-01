import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async create(data: any) {
    // Check if user already has a general review (no vehicle)
    if (!data.vehicle) {
      const existing = await this.reviewRepository.findOne({
        where: { user: { id: data.user.id }, vehicle: IsNull() }
      });
      if (existing) {
        throw new Error('User already has a general review');
      }
    }

    const review = this.reviewRepository.create(data);
    return this.reviewRepository.save(review);
  }

  async update(id: string, data: any) {
    await this.reviewRepository.update(id, data);
    return this.reviewRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async findAll() {
    return this.reviewRepository.find({ relations: ['user', 'vehicle'] });
  }

  async findById(id: string) {
    return this.reviewRepository.findOne({ where: { id }, relations: ['user'] });
  }

  async findGeneral() {
    return this.reviewRepository.find({
      where: { vehicle: IsNull() },
      relations: ['user']
    });
  }

  async findByVehicle(vehicleId: string) {
    return this.reviewRepository.find({
      where: { vehicle: { id: vehicleId } },
      relations: ['user'],
    });
  }

  async remove(id: string) {
    await this.reviewRepository.delete(id);
  }
}
