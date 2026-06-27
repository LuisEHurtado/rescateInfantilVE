import { Module } from '@nestjs/common';
import { FamiliesService } from './families.service';
import { FamiliesController } from './families.controller';
import { TimelineModule } from '../timeline/timeline.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [TimelineModule, NotificationsModule],
  providers: [FamiliesService],
  controllers: [FamiliesController],
})
export class FamiliesModule {}
