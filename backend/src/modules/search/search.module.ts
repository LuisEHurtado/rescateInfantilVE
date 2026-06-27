import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { VisitsModule } from '../visits/visits.module';

@Module({
  imports: [VisitsModule],
  providers: [SearchService],
  controllers: [SearchController],
})
export class SearchModule {}
