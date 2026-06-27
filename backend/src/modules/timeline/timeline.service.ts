import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineEventType } from '@prisma/client';

interface AddEventParams {
  childId: string;
  eventType: TimelineEventType;
  description: string;
  userId?: string | null;
  occurredAt?: Date;
  metadata?: Record<string, any>;
}

@Injectable()
export class TimelineService {
  constructor(private prisma: PrismaService) {}

  async addEvent(params: AddEventParams) {
    return this.prisma.timelineEvent.create({
      data: {
        childId: params.childId,
        eventType: params.eventType,
        description: params.description,
        userId: params.userId || null,
        occurredAt: params.occurredAt || new Date(),
        metadata: params.metadata || undefined,
      },
    });
  }
}
