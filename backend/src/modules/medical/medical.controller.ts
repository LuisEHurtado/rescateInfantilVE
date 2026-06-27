import { Controller, Get, Post, Put, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { MedicalService } from './medical.service';
import { CreateMedicalDto } from './dto/create-medical.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('medical')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('children/:childId/medical')
export class MedicalController {
  constructor(private service: MedicalService) {}

  @Get()
  @ApiOperation({ summary: 'Historial médico' })
  findAll(@Param('childId') childId: string) {
    return this.service.findAll(childId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.HOSPITAL)
  @ApiOperation({ summary: 'Crear registro médico' })
  create(@Param('childId') childId: string, @Body() dto: CreateMedicalDto, @CurrentUser() user: any) {
    return this.service.create(childId, dto, user.id);
  }

  @Put(':recordId')
  @Roles(Role.ADMIN, Role.HOSPITAL)
  @ApiOperation({ summary: 'Actualizar registro médico' })
  update(@Param('childId') childId: string, @Param('recordId') recordId: string, @Body() dto: Partial<CreateMedicalDto>, @CurrentUser() user: any) {
    return this.service.update(childId, recordId, dto, user.id);
  }

  @Patch(':recordId/discharge')
  @Roles(Role.ADMIN, Role.HOSPITAL)
  @ApiOperation({ summary: 'Registrar alta médica' })
  discharge(@Param('childId') childId: string, @Param('recordId') recordId: string, @CurrentUser() user: any) {
    return this.service.discharge(childId, recordId, user.id);
  }
}
