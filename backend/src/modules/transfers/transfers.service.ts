import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { TimelineEventType } from '@prisma/client';

@Injectable()
export class TransfersService {
  constructor(
    private prisma: PrismaService,
    private timeline: TimelineService,
    private notifications: NotificationsService,
  ) {}

  async create(childId: string, dto: CreateTransferDto, userId: string) {
    const child = await this.prisma.child.findUnique({ where: { id: childId } });
    if (!child) throw new NotFoundException('Expediente no encontrado');

    const transfer = await this.prisma.transfer.create({
      data: {
        childId,
        origin: dto.origin,
        destination: dto.destination,
        departedAt: new Date(dto.departedAt),
        arrivedAt: dto.arrivedAt ? new Date(dto.arrivedAt) : null,
        reason: dto.reason,
        transport: dto.transport,
        responsible: dto.responsible,
        observations: dto.observations,
        registeredById: userId,
      },
    });

    // Actualizar ubicación actual
    await this.prisma.currentLocation.upsert({
      where: { childId },
      create: {
        childId,
        hospital: dto.destination,
        area: dto.destinationArea,
        bedNumber: dto.destinationBed,
        since: new Date(dto.departedAt),
        updatedById: userId,
      },
      update: {
        hospital: dto.destination,
        area: dto.destinationArea || null,
        bedNumber: dto.destinationBed || null,
        since: new Date(dto.departedAt),
        updatedById: userId,
      },
    });

    await this.timeline.addEvent({
      childId,
      eventType: TimelineEventType.TRANSFER,
      description: `Traslado de ${dto.origin} a ${dto.destination}${dto.responsible ? '. Responsable: ' + dto.responsible : ''}`,
      userId,
      metadata: { transport: dto.transport, reason: dto.reason },
    });

    await this.notifications.create({
      childId,
      type: 'TRANSFER',
      title: 'Traslado registrado',
      message: `${child.code}: ${dto.origin} → ${dto.destination}`,
    });

    return transfer;
  }

  async findAll(childId: string) {
    return this.prisma.transfer.findMany({
      where: { childId },
      orderBy: { departedAt: 'desc' },
      include: { registeredBy: { select: { fullName: true } } },
    });
  }

  async getCurrentLocation(childId: string) {
    return this.prisma.currentLocation.findUnique({ where: { childId } });
  }

  async updateCurrentLocation(childId: string, data: any, userId: string) {
    return this.prisma.currentLocation.upsert({
      where: { childId },
      create: { childId, ...data, updatedById: userId },
      update: { ...data, updatedById: userId },
    });
  }
}
