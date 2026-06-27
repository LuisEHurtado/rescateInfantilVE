import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { entityType?: string; userId?: string; from?: string; to?: string; page?: number; limit?: number }) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.entityType) where.entityType = params.entityType;
    if (params.userId) where.userId = params.userId;
    if (params.from || params.to) {
      where.createdAt = {
        ...(params.from && { gte: new Date(params.from) }),
        ...(params.to && { lte: new Date(params.to) }),
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { fullName: true, role: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findByChild(childId: string) {
    return this.prisma.auditLog.findMany({
      where: { childId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { fullName: true, role: true } } },
    });
  }
}
