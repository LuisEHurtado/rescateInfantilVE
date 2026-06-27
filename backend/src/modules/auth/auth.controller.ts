import { Controller, Post, Get, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateEmergencyTokenDto } from './dto/create-emergency-token.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtener usuario actual' })
  getMe(@CurrentUser() user: any) {
    return this.authService.getMe(user.id);
  }

  @Post('emergency-tokens')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear token de emergencia' })
  createToken(@Body() dto: CreateEmergencyTokenDto, @CurrentUser() user: any) {
    return this.authService.createEmergencyToken(dto, user.id);
  }

  @Get('emergency-tokens')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Listar tokens de emergencia' })
  listTokens() {
    return this.authService.listEmergencyTokens();
  }

  @Delete('emergency-tokens/:id')
  @ApiBearerAuth()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Revocar token de emergencia' })
  revokeToken(@Param('id') id: string) {
    return this.authService.revokeEmergencyToken(id);
  }
}
