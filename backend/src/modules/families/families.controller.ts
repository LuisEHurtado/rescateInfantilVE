import { Controller, Get, Post, Put, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FamiliesService } from './families.service';
import { CreateFamilyDto, UpdateFamilyVerifyDto } from './dto/create-family.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('families')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('children/:childId/families')
export class FamiliesController {
  constructor(private service: FamiliesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar familiares' })
  findAll(@Param('childId') childId: string) {
    return this.service.findAll(childId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.RESCUER, Role.HOSPITAL)
  @ApiOperation({ summary: 'Registrar familiar' })
  create(@Param('childId') childId: string, @Body() dto: CreateFamilyDto, @CurrentUser() user: any) {
    return this.service.create(childId, dto, user.id);
  }

  @Put(':memberId')
  @Roles(Role.ADMIN, Role.RESCUER)
  @ApiOperation({ summary: 'Actualizar familiar' })
  update(@Param('childId') childId: string, @Param('memberId') memberId: string, @Body() dto: Partial<CreateFamilyDto>, @CurrentUser() user: any) {
    return this.service.update(childId, memberId, dto, user.id);
  }

  @Patch(':memberId/verify')
  @Roles(Role.ADMIN, Role.RESCUER)
  @ApiOperation({ summary: 'Verificar familiar' })
  verify(@Param('childId') childId: string, @Param('memberId') memberId: string, @Body() dto: UpdateFamilyVerifyDto, @CurrentUser() user: any) {
    return this.service.updateVerify(childId, memberId, dto, user.id);
  }
}
