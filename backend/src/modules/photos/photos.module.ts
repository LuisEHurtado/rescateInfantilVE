import { Module } from '@nestjs/common';
import { PhotosService } from './photos.service';
import { PhotosController } from './photos.controller';
import { TimelineModule } from '../timeline/timeline.module';

@Module({
  imports: [TimelineModule],
  providers: [PhotosService],
  controllers: [PhotosController],
})
export class PhotosModule {}
