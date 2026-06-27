import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { VisitsService } from './visits.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('visits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('visits')
export class VisitsController {
  constructor(private service: VisitsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Estadísticas de visitas públicas' })
  getStats() {
    return this.service.getStats();
  }

  @Get('recent')
  @ApiOperation({ summary: 'Visitas recientes' })
  getRecent(@Query('limit') limit?: string) {
    return this.service.getRecent(limit ? +limit : 50);
  }
}
