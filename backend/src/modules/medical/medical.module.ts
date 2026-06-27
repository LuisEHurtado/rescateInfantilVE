import { Module } from '@nestjs/common';
import { MedicalService } from './medical.service';
import { MedicalController } from './medical.controller';
import { TimelineModule } from '../timeline/timeline.module';

@Module({
  imports: [TimelineModule],
  providers: [MedicalService],
  controllers: [MedicalController],
})
export class MedicalModule {}
