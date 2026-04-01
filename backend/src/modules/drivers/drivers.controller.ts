import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@Controller('drivers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.driversService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.driversService.findOne(id);
  }

  @Patch(':id/availability')
  @Roles(UserRole.ADMIN, UserRole.DRIVER)
  updateAvailability(
    @Param('id') id: string,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return this.driversService.updateAvailability(id, isAvailable);
  }

  @Post('profile')
  @Roles(UserRole.ADMIN)
  createProfile(
    @Body('userId') userId: string,
    @Body('licenseNumber') licenseNumber: string,
  ) {
    return this.driversService.createDriverProfile(userId, licenseNumber);
  }
}
