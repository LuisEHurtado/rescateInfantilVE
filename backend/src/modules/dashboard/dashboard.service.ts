import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CaseStatus, IdentityStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      total, unidentified, partialIdentity, identified, hospitalized,
      inObservation, transferred, reunified, deceased,
      withFamily, withoutFamily,
    ] = await Promise.all([
      this.prisma.child.count({ where: { isActive: true } }),
      this.prisma.child.count({ where: { isActive: true, caseStatus: CaseStatus.UNIDENTIFIED } }),
      this.prisma.child.count({ where: { isActive: true, caseStatus: CaseStatus.PARTIAL_IDENTITY } }),
      this.prisma.child.count({ where: { isActive: true, caseStatus: CaseStatus.IDENTIFIED } }),
      this.prisma.child.count({ where: { isActive: true, caseStatus: CaseStatus.HOSPITALIZED } }),
      this.prisma.child.count({ where: { isActive: true, caseStatus: CaseStatus.IN_OBSERVATION } }),
      this.prisma.child.count({ where: { isActive: true, caseStatus: CaseStatus.TRANSFERRED } }),
      this.prisma.child.count({ where: { isActive: true, caseStatus: CaseStatus.REUNIFIED } }),
      this.prisma.child.count({ where: { isActive: true, caseStatus: CaseStatus.DECEASED } }),
      this.prisma.child.count({ where: { isActive: true, familyMembers: { some: {} } } }),
      this.prisma.child.count({ where: { isActive: true, familyMembers: { none: {} } } }),
    ]);

    return {
      total, unidentified, partialIdentity, identified, hospitalized,
      inObservation, transferred, reunified, deceased,
      withFamily, withoutFamily,
    };
  }

  async getByHospital() {
    const locations = await this.prisma.currentLocation.groupBy({
      by: ['hospital'],
      _count: { hospital: true },
      orderBy: { _count: { hospital: 'desc' } },
      take: 10,
    });
    return locations.map(l => ({ hospital: l.hospital, count: l._count.hospital }));
  }

  async getByState() {
    const locations = await this.prisma.findLocation.groupBy({
      by: ['state'],
      _count: { state: true },
      orderBy: { _count: { state: 'desc' } },
    });
    return locations.map(l => ({ state: l.state, count: l._count.state }));
  }

  async getRecentChildren(limit = 10) {
    return this.prisma.child.findMany({
      where: { isActive: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        currentLocation: true,
        photos: { where: { isMain: true }, take: 1 },
      },
    });
  }

  async getRecentTransfers(limit = 10) {
    return this.prisma.transfer.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { child: { select: { code: true } } },
    });
  }
}
