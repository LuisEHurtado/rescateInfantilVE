import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { TimelineService } from '../timeline/timeline.service';
import { NotificationsService } from '../notifications/notifications.service';
import { QuickRegisterDto } from './dto/quick-register.dto';
import { UpdateIdentificationDto } from './dto/update-identification.dto';
import { UpdatePhysicalDto } from './dto/update-physical.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { TimelineEventType, CaseStatus } from '@prisma/client';
import { generateChildCode } from '../../common/utils/code-generator';

@Injectable()
export class ChildrenService {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
    private timeline: TimelineService,
    private notifications: NotificationsService,
  ) {}

  async quickRegister(dto: QuickRegisterDto, userId?: string, ip = 'desconocida') {
    // Validar token de emergencia si se proporcionó uno
    if (!userId && dto.emergencyToken) {
      const valid = await this.authService.validateEmergencyToken(dto.emergencyToken);
      if (!valid) throw new UnauthorizedException('Token de emergencia inválido o expirado');
    }
    // El endpoint es @Public() — se permite registro sin autenticación ni token

    // Generar código único
    const count = await this.prisma.child.count();
    const code = generateChildCode(count + 1);

    const child = await this.prisma.child.create({
      data: {
        code,
        firstName: dto.firstName,
        lastName: dto.lastName,
        cedula: dto.cedula,
        sex: dto.sex,
        approximateAge: dto.approximateAge,
        birthDateEst: dto.birthDate ? new Date(dto.birthDate) : undefined,
        caseStatus: (dto.caseStatus as any) || undefined,
        observations: dto.observations,
        rescueOrg: dto.rescueOrg,
        rescuerName: dto.rescuerName,
        rescuerPhone: dto.rescuerPhone,
        rescuerCedula: dto.rescuerCedula,
        rescuerWhatsapp: dto.rescuerWhatsapp,
        reporterType: dto.reporterType,
        registeredById: userId || null,
        findLocation: {
          create: {
            state: dto.state,
            municipality: dto.municipality,
            parish: dto.parish,
            address: dto.foundAddress,
            gpsLat: dto.gpsLat,
            gpsLng: dto.gpsLng,
            foundAt: new Date(),
            rescueOrg: dto.rescueOrg,
            rescuerName: dto.rescuerName,
          },
        },
        currentLocation: {
          create: {
            hospital: dto.destinationHospital,
            since: new Date(),
            updatedById: userId || null,
          },
        },
      },
      include: { findLocation: true, currentLocation: true },
    });

    // Crear registros de contactos familiares
    const contacts = [
      dto.contact1Name ? { name: dto.contact1Name, rel: dto.contact1Relationship, phone: dto.contact1Phone, wa: dto.contact1Whatsapp, home: dto.contact1PhoneHome, doc: dto.contact1Cedula } : null,
      dto.contact2Name ? { name: dto.contact2Name, rel: dto.contact2Relationship, phone: dto.contact2Phone, wa: dto.contact2Whatsapp, home: dto.contact2PhoneHome, doc: dto.contact2Cedula } : null,
      dto.contact3Name ? { name: dto.contact3Name, rel: dto.contact3Relationship, phone: dto.contact3Phone, wa: dto.contact3Whatsapp, home: dto.contact3PhoneHome, doc: dto.contact3Cedula } : null,
    ].filter(Boolean);

    for (const c of contacts) {
      if (!c) continue;
      await this.prisma.familyMember.create({
        data: {
          childId: child.id,
          fullName: c.name,
          relationship: c.rel || 'No especificado',
          document: c.doc,
          phone: c.phone,
          whatsapp: c.wa,
          phoneHome: c.home,
          registeredById: userId || null,
        },
      });
    }

    await this.timeline.addEvent({
      childId: child.id,
      eventType: TimelineEventType.REGISTERED,
      description: `Niño/a registrado(a) con código ${code}. Encontrado en: ${dto.foundAddress}. Registrado por: ${dto.rescuerName} (${dto.rescuerCedula}) — IP: ${ip}`,
      userId: userId || null,
    });

    await this.notifications.create({
      childId: child.id,
      type: 'NEW_CHILD',
      title: 'Nuevo niño registrado',
      message: `Se registró ${code} - ${dto.sex} - ~${dto.approximateAge} años en ${dto.foundAddress}`,
    });

    return child;
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.child.findMany({
        where: { isActive: true },
        skip,
        take: limit,
        include: {
          currentLocation: true,
          photos: { where: { isMain: true }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.child.count({ where: { isActive: true } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const child = await this.prisma.child.findUnique({
      where: { id },
      include: {
        findLocation: true,
        currentLocation: true,
        photos: { orderBy: [{ isMain: 'desc' }, { uploadedAt: 'desc' }] },
        transfers: { orderBy: { departedAt: 'desc' } },
        medicalRecords: { orderBy: { admittedAt: 'desc' } },
        familyMembers: { orderBy: { createdAt: 'desc' } },
        timeline: { orderBy: { occurredAt: 'asc' }, include: { user: { select: { fullName: true, role: true } } } },
        registeredBy: { select: { fullName: true, role: true, organization: true } },
      },
    });
    if (!child) throw new NotFoundException(`Expediente ${id} no encontrado`);
    return child;
  }

  async updateIdentification(id: string, dto: UpdateIdentificationDto, userId: string) {
    const child = await this.findOne(id);
    const updated = await this.prisma.child.update({
      where: { id },
      data: {
        ...dto,
        birthDateEst: dto.birthDateEst ? new Date(dto.birthDateEst) : undefined,
      },
    });

    await this.timeline.addEvent({
      childId: id,
      eventType: TimelineEventType.IDENTITY_UPDATED,
      description: `Información de identificación actualizada`,
      userId,
      metadata: { changes: dto },
    });

    if (dto.identityStatus && dto.identityStatus !== child.identityStatus) {
      const statusLabels: Record<string, string> = {
        PARTIAL: 'Identidad parcial',
        IDENTIFIED: 'Identificado',
        REUNIFIED: 'Reunificado',
      };
      await this.notifications.create({
        childId: id,
        type: 'IDENTITY_UPDATE',
        title: 'Estado de identidad actualizado',
        message: `${child.code}: ${statusLabels[dto.identityStatus] || dto.identityStatus}`,
      });
    }

    return updated;
  }

  async updatePhysical(id: string, dto: UpdatePhysicalDto, userId: string) {
    await this.findOne(id);
    return this.prisma.child.update({ where: { id }, data: dto });
  }

  async updateStatus(id: string, dto: UpdateStatusDto, userId: string) {
    const child = await this.findOne(id);
    const updated = await this.prisma.child.update({
      where: { id },
      data: { caseStatus: dto.caseStatus },
    });

    const statusLabels: Record<string, string> = {
      UNIDENTIFIED: 'Sin identificar',
      PARTIAL_IDENTITY: 'Identidad parcial',
      IDENTIFIED: 'Identificado',
      HOSPITALIZED: 'Hospitalizado',
      IN_OBSERVATION: 'En observación',
      TRANSFERRED: 'Trasladado',
      REUNIFIED: 'Reunificado con familiares',
      DECEASED: 'Fallecido',
    };

    await this.timeline.addEvent({
      childId: id,
      eventType: TimelineEventType.STATUS_CHANGED,
      description: `Estado actualizado a: ${statusLabels[dto.caseStatus] || dto.caseStatus}${dto.observations ? '. ' + dto.observations : ''}`,
      userId,
    });

    if (dto.caseStatus === CaseStatus.REUNIFIED) {
      await this.notifications.create({
        childId: id,
        type: 'REUNIFICATION',
        title: 'Reunificación familiar',
        message: `${child.code} fue reunificado con su familia`,
      });
    }

    return updated;
  }

  async getTimeline(id: string) {
    await this.findOne(id);
    return this.prisma.timelineEvent.findMany({
      where: { childId: id },
      orderBy: { occurredAt: 'asc' },
      include: { user: { select: { fullName: true, role: true } } },
    });
  }
}
