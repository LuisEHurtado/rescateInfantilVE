import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFamilySearchDto } from './dto/create-family-search.dto';
import { FamilySearchStatus, Sex } from '@prisma/client';

@Injectable()
export class FamilySearchService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFamilySearchDto, ip?: string) {
    const search = await this.prisma.familySearch.create({
      data: {
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
        contactWhatsapp: dto.contactWhatsapp,
        contactEmail: dto.contactEmail,
        relationship: dto.relationship,
        childName: dto.childName,
        childSex: dto.childSex ?? Sex.UNDETERMINED,
        childAgeMin: dto.childAgeMin,
        childAgeMax: dto.childAgeMax,
        childState: dto.childState,
        childMunicipality: dto.childMunicipality,
        skinColor: dto.skinColor,
        hairColor: dto.hairColor,
        eyeColor: dto.eyeColor,
        specialMarks: dto.specialMarks,
        lastSeenAt: dto.lastSeenAt ? new Date(dto.lastSeenAt) : undefined,
        lastSeenPlace: dto.lastSeenPlace,
        circumstances: dto.circumstances,
        observations: dto.observations,
        ip,
      },
    });

    const matches = await this.findMatches(search.id);
    return { search, matches };
  }

  async findMatches(searchId: string) {
    const s = await this.prisma.familySearch.findUnique({ where: { id: searchId } });
    if (!s) return [];

    const where: any = { isActive: true };

    // Sex filter (skip UNDETERMINED)
    if (s.childSex !== Sex.UNDETERMINED) {
      where.sex = s.childSex;
    }

    // Age range ±3 years buffer
    if (s.childAgeMin != null || s.childAgeMax != null) {
      const ageMin = (s.childAgeMin ?? 0) - 3;
      const ageMax = (s.childAgeMax ?? s.childAgeMin ?? 18) + 3;
      where.approximateAge = { gte: Math.max(0, ageMin), lte: ageMax };
    }

    // State filter
    if (s.childState) {
      where.findLocation = { state: { contains: s.childState, mode: 'insensitive' } };
    }

    const candidates = await this.prisma.child.findMany({
      where,
      include: {
        photos: { where: { isMain: true }, take: 1 },
        findLocation: true,
        currentLocation: true,
      },
      take: 20,
    });

    // Score each candidate
    const scored = candidates.map(child => {
      let score = 0;
      const reasons: string[] = [];

      // Name match
      if (s.childName && s.childName.trim()) {
        const searchTerms = s.childName.toLowerCase().split(/\s+/);
        const childFullName = [child.firstName, child.secondName, child.lastName]
          .filter(Boolean).join(' ').toLowerCase();
        const matchedTerms = searchTerms.filter(t => childFullName.includes(t));
        if (matchedTerms.length > 0) {
          score += matchedTerms.length * 30;
          reasons.push(`Nombre coincide (${matchedTerms.join(', ')})`);
        }
      }

      // Sex match
      if (s.childSex !== Sex.UNDETERMINED && child.sex === s.childSex) {
        score += 15;
        reasons.push('Sexo coincide');
      }

      // Age proximity
      if (child.approximateAge != null && (s.childAgeMin != null || s.childAgeMax != null)) {
        const ageTarget = s.childAgeMin != null && s.childAgeMax != null
          ? (s.childAgeMin + s.childAgeMax) / 2
          : (s.childAgeMin ?? s.childAgeMax ?? child.approximateAge);
        const diff = Math.abs(child.approximateAge - ageTarget);
        if (diff === 0) { score += 20; reasons.push('Edad exacta'); }
        else if (diff <= 1) { score += 15; reasons.push('Edad ±1 año'); }
        else if (diff <= 2) { score += 10; reasons.push('Edad ±2 años'); }
        else if (diff <= 3) { score += 5; reasons.push('Edad ±3 años'); }
      }

      // Physical traits
      if (s.skinColor && child.skinColor?.toLowerCase().includes(s.skinColor.toLowerCase())) {
        score += 10; reasons.push('Tono de piel');
      }
      if (s.hairColor && child.hairColor?.toLowerCase().includes(s.hairColor.toLowerCase())) {
        score += 10; reasons.push('Color de cabello');
      }
      if (s.eyeColor && child.eyeColor?.toLowerCase().includes(s.eyeColor.toLowerCase())) {
        score += 10; reasons.push('Color de ojos');
      }

      return { child, score, reasons };
    });

    return scored
      .filter(s => s.score >= 15)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  async list(status?: FamilySearchStatus) {
    return this.prisma.familySearch.findMany({
      where: status ? { status } : undefined,
      include: { resolvedChild: { include: { photos: { where: { isMain: true }, take: 1 } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.familySearch.findUnique({
      where: { id },
      include: { resolvedChild: { include: { photos: { where: { isMain: true }, take: 1 } } } },
    });
  }

  async updateStatus(id: string, status: FamilySearchStatus, adminNotes?: string, resolvedChildId?: string) {
    return this.prisma.familySearch.update({
      where: { id },
      data: { status, adminNotes, resolvedChildId },
    });
  }

  async stats() {
    const [active, reviewing, matched, closed] = await Promise.all([
      this.prisma.familySearch.count({ where: { status: 'ACTIVE' } }),
      this.prisma.familySearch.count({ where: { status: 'REVIEWING' } }),
      this.prisma.familySearch.count({ where: { status: 'MATCHED' } }),
      this.prisma.familySearch.count({ where: { status: 'CLOSED' } }),
    ]);
    return { active, reviewing, matched, closed, total: active + reviewing + matched + closed };
  }
}
