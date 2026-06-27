import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('audit')
export class AuditController {
  constructor(private service: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Log de auditoría' })
  findAll(
    @Query('entityType') entityType?: string,
    @Query('userId') userId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll({ entityType, userId, from, to, page: page ? +page : 1, limit: limit ? +limit : 50 });
  }

  @Get('child/:childId')
  @ApiOperation({ summary: 'Auditoría por expediente' })
  findByChild(@Param('childId') childId: string) {
    return this.service.findByChild(childId);
  }
}
