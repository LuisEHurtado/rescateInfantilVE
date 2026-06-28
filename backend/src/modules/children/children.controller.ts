import {
  Controller, Get, Post, Put, Patch, Body, Param, Query,
  UseGuards, UseInterceptors, UploadedFile, Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ChildrenService } from './children.service';
import { QuickRegisterDto } from './dto/quick-register.dto';
import { UpdateIdentificationDto } from './dto/update-identification.dto';
import { UpdatePhysicalDto } from './dto/update-physical.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('children')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('children')
export class ChildrenController {
  constructor(private childrenService: ChildrenService) {}

  @Public()
  @Post('quick-register')
  @ApiOperation({ summary: 'Registro rápido (con sesión o con token de emergencia)' })
  quickRegister(@Body() dto: QuickRegisterDto, @Request() req: any) {
    const userId = req.user?.id;
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || req.headers['x-real-ip']
      || req.socket?.remoteAddress
      || 'desconocida';
    const ua   = req.headers['user-agent'] || null;
    const lang = req.headers['accept-language']?.split(',')[0] || null;
    return this.childrenService.quickRegister(dto, userId, ip as string, ua, lang);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar expedientes' })
  findAll(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.childrenService.findAll(+page, +limit);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ver expediente completo' })
  findOne(@Param('id') id: string) {
    return this.childrenService.findOne(id);
  }

  @Put(':id/identification')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.RESCUER)
  @ApiOperation({ summary: 'Actualizar identificación' })
  updateIdentification(
    @Param('id') id: string,
    @Body() dto: UpdateIdentificationDto,
    @CurrentUser() user: any,
  ) {
    return this.childrenService.updateIdentification(id, dto, user.id);
  }

  @Put(':id/physical')
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.RESCUER)
  @ApiOperation({ summary: 'Actualizar descripción física' })
  updatePhysical(
    @Param('id') id: string,
    @Body() dto: UpdatePhysicalDto,
    @CurrentUser() user: any,
  ) {
    return this.childrenService.updatePhysical(id, dto, user.id);
  }

  @Patch(':id/status')
  @Public()
  @ApiOperation({ summary: 'Cambiar estado del expediente' })
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.childrenService.updateStatus(id, dto, user?.id ?? null);
  }

  @Get(':id/timeline')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ver línea de tiempo' })
  getTimeline(@Param('id') id: string) {
    return this.childrenService.getTimeline(id);
  }
}
