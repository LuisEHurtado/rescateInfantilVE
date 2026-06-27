import { Module } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { AuthModule } from '../auth/auth.module';
import { TimelineModule } from '../timeline/timeline.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [AuthModule, TimelineModule, NotificationsModule],
  providers: [ChildrenService],
  controllers: [ChildrenController],
  exports: [ChildrenService],
})
export class ChildrenModule {}
