import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

class UpdateLocationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() hospital?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() area?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bedNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
}

@ApiTags('transfers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('children/:childId')
export class TransfersController {
  constructor(private service: TransfersService) {}

  @Get('transfers')
  @ApiOperation({ summary: 'Historial de traslados' })
  findAll(@Param('childId') childId: string) {
    return this.service.findAll(childId);
  }

  @Post('transfers')
  @Roles(Role.ADMIN, Role.RESCUER, Role.HOSPITAL)
  @ApiOperation({ summary: 'Registrar traslado' })
  create(
    @Param('childId') childId: string,
    @Body() dto: CreateTransferDto,
    @CurrentUser() user: any,
  ) {
    return this.service.create(childId, dto, user.id);
  }

  @Get('location')
  @ApiOperation({ summary: 'Ubicación actual' })
  getLocation(@Param('childId') childId: string) {
    return this.service.getCurrentLocation(childId);
  }

  @Put('location')
  @Roles(Role.ADMIN, Role.RESCUER, Role.HOSPITAL)
  @ApiOperation({ summary: 'Actualizar ubicación actual' })
  updateLocation(
    @Param('childId') childId: string,
    @Body() dto: UpdateLocationDto,
    @CurrentUser() user: any,
  ) {
    return this.service.updateCurrentLocation(childId, dto, user.id);
  }
}
