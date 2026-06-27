import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateFamilyDto, UpdateFamilyVerifyDto } from './dto/create-family.dto';
import { TimelineEventType, FamilyVerifyStatus } from '@prisma/client';

@Injectable()
export class FamiliesService {
  constructor(
    private prisma: PrismaService,
    private timeline: TimelineService,
    private notifications: NotificationsService,
  ) {}

  async create(childId: string, dto: CreateFamilyDto, userId: string) {
    const child = await this.prisma.child.findUnique({ where: { id: childId } });
    if (!child) throw new NotFoundException('Expediente no encontrado');

    const member = await this.prisma.familyMember.create({
      data: { childId, ...dto, registeredById: userId },
    });

    await this.timeline.addEvent({
      childId,
      eventType: TimelineEventType.FAMILY_ADDED,
      description: `Familiar registrado: ${dto.fullName} (${dto.relationship})`,
      userId,
    });

    await this.notifications.create({
      childId,
      type: 'FAMILY_ADDED',
      title: 'Familiar identificado',
      message: `${child.code}: Se agregó ${dto.fullName} como ${dto.relationship}`,
    });

    return member;
  }

  async findAll(childId: string) {
    return this.prisma.familyMember.findMany({
      where: { childId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(childId: string, memberId: string, dto: Partial<CreateFamilyDto>, userId: string) {
    const member = await this.prisma.familyMember.findFirst({ where: { id: memberId, childId } });
    if (!member) throw new NotFoundException('Familiar no encontrado');
    return this.prisma.familyMember.update({ where: { id: memberId }, data: dto });
  }

  async updateVerify(childId: string, memberId: string, dto: UpdateFamilyVerifyDto, userId: string) {
    const member = await this.prisma.familyMember.findFirst({ where: { id: memberId, childId } });
    if (!member) throw new NotFoundException('Familiar no encontrado');

    const updated = await this.prisma.familyMember.update({
      where: { id: memberId },
      data: { verifyStatus: dto.verifyStatus, observations: dto.observations },
    });

    if (dto.verifyStatus === FamilyVerifyStatus.CONFIRMED) {
      await this.timeline.addEvent({
        childId,
        eventType: TimelineEventType.FAMILY_VERIFIED,
        description: `Familiar confirmado: ${member.fullName} (${member.relationship})`,
        userId,
      });
    }

    return updated;
  }
}
