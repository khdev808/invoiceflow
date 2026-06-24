import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PushService } from './push.service';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private push: PushService,
  ) {}

  findAll(userId: string, unreadOnly?: boolean) {
    return this.prisma.notification.findMany({
      where: { userId, ...(unreadOnly && { read: false }) },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async notify(
    userId: string,
    payload: { title: string; body: string; type: string; data?: Record<string, unknown> },
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        title: payload.title,
        body: payload.body,
        type: payload.type,
        data: (payload.data || {}) as object,
      },
    });
    await this.push.sendToUser(userId, payload.title, payload.body, {
      ...payload.data,
      type: payload.type,
      notificationId: notification.id,
    });
    return notification;
  }

  async markRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  unreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, read: false } });
  }
}
