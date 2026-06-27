import { Controller, Post, Get, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { FamilySearchService } from './family-search.service';
import { CreateFamilySearchDto } from './dto/create-family-search.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role, FamilySearchStatus } from '@prisma/client';

@ApiTags('family-search')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('family-search')
export class FamilySearchController {
  constructor(private service: FamilySearchService) {}

  @Public()
  @Post()
  @Throttle({ default: { ttl: 3600000, limit: 10 } })
  @ApiOperation({ summary: 'Registrar búsqueda de familiar (público)' })
  create(@Body() dto: CreateFamilySearchDto, @Req() req: Request) {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    return this.service.create(dto, ip);
  }

  @Get()
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.RESCUER)
  @ApiOperation({ summary: 'Listar búsquedas de familiares' })
  list(@Query('status') status?: FamilySearchStatus) {
    return this.service.list(status);
  }

  @Get('stats')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.RESCUER)
  @ApiOperation({ summary: 'Estadísticas de búsquedas' })
  stats() {
    return this.service.stats();
  }

  @Get(':id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.RESCUER)
  @ApiOperation({ summary: 'Obtener búsqueda con matches' })
  async findOne(@Param('id') id: string) {
    const search = await this.service.findOne(id);
    const matches = await this.service.findMatches(id);
    return { search, matches };
  }

  @Patch(':id/status')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.RESCUER)
  @ApiOperation({ summary: 'Actualizar estado de búsqueda' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: FamilySearchStatus; adminNotes?: string; resolvedChildId?: string },
  ) {
    return this.service.updateStatus(id, body.status, body.adminNotes, body.resolvedChildId);
  }
}
