import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get()
  findAll(@Request() req: { user: { userId: string } }) {
    return this.notifications.findAll(req.user.userId);
  }

  @Get('unread-count')
  unreadCount(@Request() req: { user: { userId: string } }) {
    return this.notifications.unreadCount(req.user.userId);
  }

  @Patch('read-all')
  markAllRead(@Request() req: { user: { userId: string } }) {
    return this.notifications.markAllRead(req.user.userId);
  }

  @Patch(':id/read')
  markRead(@Request() req: { user: { userId: string } }, @Param('id') id: string) {
    return this.notifications.markRead(req.user.userId, id);
  }
}
