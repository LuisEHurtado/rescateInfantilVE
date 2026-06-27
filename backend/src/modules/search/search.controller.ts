import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { SearchService } from './search.service';
import { VisitsService } from '../visits/visits.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { Sex, CaseStatus, IdentityStatus } from '@prisma/client';

@ApiTags('search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(
    private service: SearchService,
    private visits: VisitsService,
  ) {}

  @Get('stats')
  @Public()
  @ApiOperation({ summary: 'Estadísticas públicas' })
  getStats() {
    return this.service.getStats();
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Búsqueda avanzada de expedientes' })
  search(
    @Req() req: Request,
    @Query('q') q?: string,
    @Query('sex') sex?: Sex,
    @Query('caseStatus') caseStatus?: CaseStatus,
    @Query('identityStatus') identityStatus?: IdentityStatus,
    @Query('hospital') hospital?: string,
    @Query('state') state?: string,
    @Query('municipality') municipality?: string,
    @Query('rescueOrg') rescueOrg?: string,
    @Query('ageMin') ageMin?: string,
    @Query('ageMax') ageMax?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('familyName') familyName?: string,
    @Query('familyDocument') familyDocument?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || req.socket?.remoteAddress
      || 'desconocida';
    const ua = req.headers['user-agent'] || '';
    const isMobile = /mobile|android|iphone|ipad/i.test(ua);

    const filters: Record<string, any> = {};
    if (sex) filters.sex = sex;
    if (caseStatus) filters.caseStatus = caseStatus;
    if (hospital) filters.hospital = hospital;
    if (state) filters.state = state;
    if (municipality) filters.municipality = municipality;

    // Solo loguear página 1 para no inflar el conteo
    if (!page || page === '1') {
      this.visits.log({
        ip,
        userAgent: ua,
        searchQuery: q || undefined,
        filters: Object.keys(filters).length ? filters : undefined,
        isMobile,
      });
    }

    return this.service.search({
      q, sex, caseStatus, identityStatus, hospital, state, municipality,
      rescueOrg, familyName, familyDocument,
      ageMin: ageMin ? +ageMin : undefined,
      ageMax: ageMax ? +ageMax : undefined,
      dateFrom, dateTo,
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
    });
  }
}
