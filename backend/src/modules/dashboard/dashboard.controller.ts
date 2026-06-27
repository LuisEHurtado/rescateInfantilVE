import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get('stats') @ApiOperation({ summary: 'Estadísticas generales' })
  getStats() { return this.service.getStats(); }

  @Get('by-hospital') @ApiOperation({ summary: 'Distribución por hospital' })
  getByHospital() { return this.service.getByHospital(); }

  @Get('by-state') @ApiOperation({ summary: 'Distribución por estado' })
  getByState() { return this.service.getByState(); }

  @Get('recent-children') @ApiOperation({ summary: 'Últimos registros' })
  getRecentChildren() { return this.service.getRecentChildren(); }

  @Get('recent-transfers') @ApiOperation({ summary: 'Últimos traslados' })
  getRecentTransfers() { return this.service.getRecentTransfers(); }
}
