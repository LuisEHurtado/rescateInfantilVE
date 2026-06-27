import { Module } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { TransfersController } from './transfers.controller';
import { TimelineModule } from '../timeline/timeline.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TimelineModule, NotificationsModule],
  providers: [TransfersService],
  controllers: [TransfersController],
})
export class TransfersModule {}
