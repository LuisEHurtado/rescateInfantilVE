import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';
import { CreateMedicalDto } from './dto/create-medical.dto';
import { TimelineEventType } from '@prisma/client';

@Injectable()
export class MedicalService {
  constructor(
    private prisma: PrismaService,
    private timeline: TimelineService,
  ) {}

  async create(childId: string, dto: CreateMedicalDto, userId: string) {
    const child = await this.prisma.child.findUnique({ where: { id: childId } });
    if (!child) throw new NotFoundException('Expediente no encontrado');

    const record = await this.prisma.medicalRecord.create({
      data: {
        childId,
        hospital: dto.hospital,
        admittedAt: new Date(dto.admittedAt),
        diagnosis: dto.diagnosis,
        healthStatus: dto.healthStatus,
        doctor: dto.doctor,
        treatment: dto.treatment,
        dischargedAt: dto.dischargedAt ? new Date(dto.dischargedAt) : null,
        observations: dto.observations,
        registeredById: userId,
      },
    });

    await this.timeline.addEvent({
      childId,
      eventType: TimelineEventType.MEDICAL_ADMISSION,
      description: `Ingreso médico en ${dto.hospital}${dto.diagnosis ? '. Diagnóstico: ' + dto.diagnosis : ''}${dto.doctor ? '. Dr. ' + dto.doctor : ''}`,
      userId,
    });

    return record;
  }

  async findAll(childId: string) {
    return this.prisma.medicalRecord.findMany({
      where: { childId },
      orderBy: { admittedAt: 'desc' },
      include: { registeredBy: { select: { fullName: true } } },
    });
  }

  async update(childId: string, recordId: string, dto: Partial<CreateMedicalDto>, userId: string) {
    const record = await this.prisma.medicalRecord.findFirst({ where: { id: recordId, childId } });
    if (!record) throw new NotFoundException('Registro médico no encontrado');

    const updated = await this.prisma.medicalRecord.update({
      where: { id: recordId },
      data: {
        ...dto,
        admittedAt: dto.admittedAt ? new Date(dto.admittedAt) : undefined,
        dischargedAt: dto.dischargedAt ? new Date(dto.dischargedAt) : undefined,
      },
    });

    await this.timeline.addEvent({
      childId,
      eventType: TimelineEventType.MEDICAL_UPDATE,
      description: `Registro médico actualizado en ${record.hospital}`,
      userId,
    });

    return updated;
  }

  async discharge(childId: string, recordId: string, userId: string) {
    const record = await this.prisma.medicalRecord.findFirst({ where: { id: recordId, childId } });
    if (!record) throw new NotFoundException('Registro médico no encontrado');

    const updated = await this.prisma.medicalRecord.update({
      where: { id: recordId },
      data: { dischargedAt: new Date() },
    });

    await this.timeline.addEvent({
      childId,
      eventType: TimelineEventType.MEDICAL_DISCHARGE,
      description: `Alta médica en ${record.hospital}`,
      userId,
    });

    return updated;
  }
}
