import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VisitsService {
  constructor(private prisma: PrismaService) {}

  async log(data: {
    ip: string;
    userAgent?: string;
    searchQuery?: string;
    filters?: Record<string, any>;
    isMobile?: boolean;
  }) {
    try {
      await this.prisma.visitLog.create({ data });
    } catch (_) {}
  }

  async getStats() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, today, thisWeek, thisMonth, uniqueIpsToday, mobileToday] = await Promise.all([
      this.prisma.visitLog.count(),
      this.prisma.visitLog.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.visitLog.count({ where: { createdAt: { gte: weekStart } } }),
      this.prisma.visitLog.count({ where: { createdAt: { gte: monthStart } } }),
      this.prisma.visitLog.findMany({
        where: { createdAt: { gte: todayStart } },
        select: { ip: true },
        distinct: ['ip'],
      }),
      this.prisma.visitLog.count({ where: { createdAt: { gte: todayStart }, isMobile: true } }),
    ]);

    // Top búsquedas (últimos 7 días)
    const recentSearches = await this.prisma.visitLog.findMany({
      where: { createdAt: { gte: weekStart }, searchQuery: { not: null } },
      select: { searchQuery: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    const searchCount: Record<string, number> = {};
    for (const r of recentSearches) {
      if (r.searchQuery) {
        const q = r.searchQuery.toLowerCase().trim();
        searchCount[q] = (searchCount[q] || 0) + 1;
      }
    }
    const topSearches = Object.entries(searchCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([term, count]) => ({ term, count }));

    // Visitas por hora (últimas 24h)
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const byHour = await this.prisma.visitLog.findMany({
      where: { createdAt: { gte: last24h } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    const hourBuckets: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hourBuckets[i] = 0;
    for (const v of byHour) {
      hourBuckets[v.createdAt.getHours()] = (hourBuckets[v.createdAt.getHours()] || 0) + 1;
    }
    const visitsByHour = Object.entries(hourBuckets).map(([hour, count]) => ({ hour: +hour, count }));

    return {
      total,
      today,
      thisWeek,
      thisMonth,
      uniqueIpsToday: uniqueIpsToday.length,
      mobileToday,
      desktopToday: today - mobileToday,
      topSearches,
      visitsByHour,
    };
  }

  async getRecent(limit = 50) {
    return this.prisma.visitLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        ip: true,
        searchQuery: true,
        isMobile: true,
        filters: true,
        createdAt: true,
      },
    });
  }
}
