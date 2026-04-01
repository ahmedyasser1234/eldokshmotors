import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { PurchaseRequestsService } from './purchase-requests.service';
import { CreatePurchaseRequestDto } from './dto/create-purchase-request.dto';
import { UpdatePurchaseRequestStatusDto } from './dto/update-purchase-request-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

import { ConfirmPurchaseDto } from './dto/confirm-purchase.dto';

@Controller('purchase-requests')
export class PurchaseRequestsController {
  constructor(private readonly purchaseRequestsService: PurchaseRequestsService) {}

  @Post()
  create(@Body() createDto: CreatePurchaseRequestDto, @Request() req) {
    return this.purchaseRequestsService.create(createDto, req.user);
  }

  @Post(':id/confirm-purchase')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  confirmPurchase(@Param('id') id: string, @Body() confirmDto: ConfirmPurchaseDto) {
    return this.purchaseRequestsService.confirmPurchase(id, confirmDto);
  }

  @Get('my-requests')
  @UseGuards(JwtAuthGuard)
  findByUser(@Request() req) {
    return this.purchaseRequestsService.findByUser(req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.purchaseRequestsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.purchaseRequestsService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(@Param('id') id: string, @Body() updateDto: UpdatePurchaseRequestStatusDto) {
    return this.purchaseRequestsService.updateStatus(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.purchaseRequestsService.remove(id);
  }
}
