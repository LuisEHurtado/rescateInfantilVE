import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificaciones' })
  findAll(@CurrentUser() user: any, @Query('unread') unread?: string) {
    return this.service.findForUser(user.id, unread === 'true');
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Contar no leídas' })
  countUnread() {
    return this.service.countUnread();
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar como leída' })
  markRead(@Param('id') id: string) {
    return this.service.markRead(id);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Marcar todas como leídas' })
  markAllRead() {
    return this.service.markAllRead();
  }
}
