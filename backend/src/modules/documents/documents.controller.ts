import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.documentsService.findAll();
  }

  @Post('upload')
  upload(@GetUser() user: User, @Body() data: any) {
    return this.documentsService.uploadDocument(user.id, data);
  }

  @Patch(':id/verify')
  @Roles(UserRole.ADMIN)
  verify(@Param('id') id: string, @Body('verified') verified: boolean) {
    return this.documentsService.updateStatus(id, verified);
  }
}
