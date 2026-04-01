import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@GetUser() user: User) {
    return this.notificationsService.findForUser(user.id);
  }

  @Get('unread-counts')
  getUnreadCounts(@GetUser() user: User) {
    return this.notificationsService.getUnreadCounts(user.id);
  }

  @Patch('read-type/:type')
  markTypeAsRead(@GetUser() user: User, @Param('type') type: string) {
    return this.notificationsService.markTypeAsRead(user.id, type);
  }

  @Patch('read-all')
  markAllAsReadUser(@GetUser() user: User) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
