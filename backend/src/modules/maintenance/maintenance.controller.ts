import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  findAll() {
    return this.maintenanceService.findAll();
  }

  @Post()
  create(@Body() data: any) {
    return this.maintenanceService.create(data);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.maintenanceService.completeMaintenance(id);
  }
}
