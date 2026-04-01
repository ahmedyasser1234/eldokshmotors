import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { AddonsService } from './addons.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@Controller('addons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AddonsController {
  constructor(private readonly addonsService: AddonsService) {}

  @Get()
  findAll() {
    return this.addonsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.addonsService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() data: any) {
    return this.addonsService.create(data);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() data: any) {
    return this.addonsService.update(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.addonsService.remove(id);
  }
}
