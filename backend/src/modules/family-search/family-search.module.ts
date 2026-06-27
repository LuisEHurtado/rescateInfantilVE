import { Module } from '@nestjs/common';
import { FamilySearchController } from './family-search.controller';
import { FamilySearchService } from './family-search.service';

@Module({
  controllers: [FamilySearchController],
  providers: [FamilySearchService],
  exports: [FamilySearchService],
})
export class FamilySearchModule {}
