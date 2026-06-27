import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private service: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Generar reporte (CSV)' })
  @ApiQuery({ name: 'type', enum: ['general', 'unidentified', 'identified', 'hospitalized', 'reunified', 'by-hospital', 'by-state', 'transfers'] })
  @ApiQuery({ name: 'hospital', required: false })
  @ApiQuery({ name: 'state', required: false })
  async generate(
    @Query('type') type: any,
    @Query('hospital') hospital?: string,
    @Query('state') state?: string,
    @Res() res?: Response,
  ) {
    const data = await this.service.getData({ type, hospital, state });
    const csv = this.service.buildCsvContent(data as any[], type);
    const filename = `rescate_${type}_${new Date().toISOString().slice(0, 10)}.csv`;

    res!.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res!.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res!.send('﻿' + csv); // BOM for Excel UTF-8
  }

  @Get('json')
  @ApiOperation({ summary: 'Datos de reporte en JSON' })
  generateJson(
    @Query('type') type: any,
    @Query('hospital') hospital?: string,
    @Query('state') state?: string,
  ) {
    return this.service.getData({ type, hospital, state });
  }
}
