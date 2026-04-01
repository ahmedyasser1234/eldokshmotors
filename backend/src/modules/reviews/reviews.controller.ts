import { Controller, Get, Post, Body, Param, Delete, UseGuards, ForbiddenException, Patch, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@GetUser() user: User, @Body() data: any) {
    if (user.role === 'admin') {
      throw new ForbiddenException('Admins are not allowed to create reviews');
    }
    return this.reviewsService.create({
      ...data,
      user: { id: user.id },
    });
  }

  @Get('vehicle/:vehicleId')
  findByVehicle(@Param('vehicleId') vehicleId: string) {
    return this.reviewsService.findByVehicle(vehicleId);
  }

  @Get('general')
  findGeneral() {
    return this.reviewsService.findGeneral();
  }

  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @GetUser() user: User, @Body() data: any) {
    const existing = await this.reviewsService.findById(id);
    if (!existing) throw new NotFoundException('Review not found');

    if (user.role !== 'admin' && existing.user.id !== user.id) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    return this.reviewsService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @GetUser() user: User) {
    const existing = await this.reviewsService.findById(id);
    if (!existing) throw new NotFoundException('Review not found');

    if (user.role !== 'admin' && existing.user.id !== user.id) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    return this.reviewsService.remove(id);
  }
}
