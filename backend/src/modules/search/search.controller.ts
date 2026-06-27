import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { Sex, CaseStatus, IdentityStatus } from '@prisma/client';

@ApiTags('search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('search')
export class SearchController {
  constructor(private service: SearchService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Búsqueda avanzada de expedientes' })
  search(
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
