import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface CreateNotificationParams {
  childId?: string;
  type: string;
  title: string;
  message: string;
  userId?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(params: CreateNotificationParams) {
    return this.prisma.notification.create({
      data: {
        childId: params.childId || null,
        userId: params.userId || null,
        type: params.type,
        title: params.title,
        message: params.message,
      },
    });
  }

  async findForUser(userId: string, onlyUnread = false) {
    return this.prisma.notification.findMany({
      where: { ...(onlyUnread ? { isRead: false } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { child: { select: { code: true } } },
    });
  }

  async markRead(id: string) {
    return this.prisma.notification.update({ where: { id }, data: { isRead: true } });
  }

  async markAllRead() {
    return this.prisma.notification.updateMany({ where: { isRead: false }, data: { isRead: true } });
  }

  async countUnread() {
    return this.prisma.notification.count({ where: { isRead: false } });
  }
}
