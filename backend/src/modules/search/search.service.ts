import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, Sex, CaseStatus, IdentityStatus } from '@prisma/client';

export interface SearchParams {
  q?: string;
  sex?: Sex;
  caseStatus?: CaseStatus;
  identityStatus?: IdentityStatus;
  hospital?: string;
  state?: string;
  municipality?: string;
  rescueOrg?: string;
  ageMin?: number;
  ageMax?: number;
  dateFrom?: string;
  dateTo?: string;
  familyName?: string;
  familyDocument?: string;
  skinColor?: string;
  hairColor?: string;
  eyeColor?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(params: SearchParams) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ChildWhereInput = { isActive: true, status: 1 };

    if (params.q) {
      where.OR = [
        { code: { contains: params.q, mode: 'insensitive' } },
        { firstName: { contains: params.q, mode: 'insensitive' } },
        { lastName: { contains: params.q, mode: 'insensitive' } },
        { nickname: { contains: params.q, mode: 'insensitive' } },
        { currentLocation: { hospital: { contains: params.q, mode: 'insensitive' } } },
      ];
    }

    if (params.sex) where.sex = params.sex;
    if (params.caseStatus) where.caseStatus = params.caseStatus;
    if (params.identityStatus) where.identityStatus = params.identityStatus;
    if (params.rescueOrg) where.rescueOrg = { contains: params.rescueOrg, mode: 'insensitive' };

    if (params.ageMin !== undefined || params.ageMax !== undefined) {
      where.approximateAge = {
        ...(params.ageMin !== undefined && { gte: params.ageMin }),
        ...(params.ageMax !== undefined && { lte: params.ageMax }),
      };
    }

    if (params.dateFrom || params.dateTo) {
      where.rescuedAt = {
        ...(params.dateFrom && { gte: new Date(params.dateFrom) }),
        ...(params.dateTo && { lte: new Date(params.dateTo) }),
      };
    }

    if (params.hospital) {
      where.currentLocation = { hospital: { contains: params.hospital, mode: 'insensitive' } };
    }

    if (params.state || params.municipality) {
      where.findLocation = {
        ...(params.state && { state: { contains: params.state, mode: 'insensitive' } }),
        ...(params.municipality && { municipality: { contains: params.municipality, mode: 'insensitive' } }),
      };
    }

    if (params.skinColor) where.skinColor = { contains: params.skinColor, mode: 'insensitive' };
    if (params.hairColor) where.hairColor = { contains: params.hairColor, mode: 'insensitive' };
    if (params.eyeColor)  where.eyeColor  = { contains: params.eyeColor,  mode: 'insensitive' };

    if (params.familyName || params.familyDocument) {
      where.familyMembers = {
        some: {
          ...(params.familyName && { fullName: { contains: params.familyName, mode: 'insensitive' } }),
          ...(params.familyDocument && { document: { contains: params.familyDocument, mode: 'insensitive' } }),
        },
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.child.findMany({
        where,
        skip,
        take: limit,
        include: {
          currentLocation: true,
          findLocation: { select: { state: true, municipality: true } },
          photos: { where: { isMain: true }, take: 1 },
          familyMembers: { select: { id: true, fullName: true, relationship: true, phone: true, whatsapp: true, verifyStatus: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.child.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getStats() {
    const [total, hospitalized, reunified, identified, unidentified, inObservation] = await Promise.all([
      this.prisma.child.count({ where: { isActive: true, status: 1 } }),
      this.prisma.child.count({ where: { isActive: true, status: 1, caseStatus: 'HOSPITALIZED' } }),
      this.prisma.child.count({ where: { isActive: true, status: 1, caseStatus: 'REUNIFIED' } }),
      this.prisma.child.count({ where: { isActive: true, status: 1, caseStatus: 'IDENTIFIED' } }),
      this.prisma.child.count({ where: { isActive: true, status: 1, caseStatus: 'UNIDENTIFIED' } }),
      this.prisma.child.count({ where: { isActive: true, status: 1, caseStatus: 'IN_OBSERVATION' } }),
    ]);
    return { total, hospitalized, reunified, identified, unidentified, inObservation };
  }
}
