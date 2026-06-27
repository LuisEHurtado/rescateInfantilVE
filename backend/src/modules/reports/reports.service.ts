import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CaseStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getData(filter: {
    type: 'general' | 'unidentified' | 'identified' | 'hospitalized' | 'reunified' | 'by-hospital' | 'by-state' | 'transfers';
    hospital?: string;
    state?: string;
  }) {
    const baseInclude = {
      currentLocation: true,
      findLocation: { select: { state: true, municipality: true, foundAt: true } },
      photos: { where: { isMain: true }, take: 1 },
      familyMembers: { select: { fullName: true, relationship: true, verifyStatus: true } },
    };

    switch (filter.type) {
      case 'general':
        return this.prisma.child.findMany({ where: { isActive: true }, include: baseInclude, orderBy: { code: 'asc' } });
      case 'unidentified':
        return this.prisma.child.findMany({ where: { isActive: true, caseStatus: CaseStatus.UNIDENTIFIED }, include: baseInclude });
      case 'identified':
        return this.prisma.child.findMany({ where: { isActive: true, caseStatus: CaseStatus.IDENTIFIED }, include: baseInclude });
      case 'hospitalized':
        return this.prisma.child.findMany({ where: { isActive: true, caseStatus: CaseStatus.HOSPITALIZED }, include: baseInclude });
      case 'reunified':
        return this.prisma.child.findMany({ where: { isActive: true, caseStatus: CaseStatus.REUNIFIED }, include: baseInclude });
      case 'by-hospital':
        return this.prisma.child.findMany({
          where: { isActive: true, currentLocation: { hospital: { contains: filter.hospital || '', mode: 'insensitive' } } },
          include: baseInclude,
        });
      case 'by-state':
        return this.prisma.child.findMany({
          where: { isActive: true, findLocation: { state: { contains: filter.state || '', mode: 'insensitive' } } },
          include: baseInclude,
        });
      case 'transfers':
        return this.prisma.transfer.findMany({
          orderBy: { departedAt: 'desc' },
          include: { child: { select: { code: true, firstName: true, lastName: true } }, registeredBy: { select: { fullName: true } } },
        });
      default:
        return [];
    }
  }

  buildCsvContent(data: any[], type: string): string {
    if (type === 'transfers') {
      const headers = ['Código', 'Origen', 'Destino', 'Fecha Salida', 'Responsable'];
      const rows = data.map((t: any) => [
        t.child?.code || '', t.origin, t.destination,
        new Date(t.departedAt).toLocaleString('es-VE'),
        t.responsible || '',
      ]);
      return [headers, ...rows].map(r => r.join(',')).join('\n');
    }

    const headers = ['Código', 'Nombre', 'Sexo', 'Edad', 'Estado Expediente', 'Hospital Actual', 'Estado', 'Municipio', 'Fecha Rescate'];
    const rows = data.map((c: any) => [
      c.code,
      [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Sin nombre',
      c.sex === 'MALE' ? 'Masculino' : c.sex === 'FEMALE' ? 'Femenino' : 'Indeterminado',
      c.approximateAge ? `~${c.approximateAge}` : '',
      c.caseStatus,
      c.currentLocation?.hospital || '',
      c.findLocation?.state || '',
      c.findLocation?.municipality || '',
      new Date(c.rescuedAt || c.createdAt).toLocaleDateString('es-VE'),
    ]);
    return [headers, ...rows].map(r => r.join(',')).join('\n');
  }
}
