import { Module } from '@nestjs/common';
import { InflationController } from './inflation.controller';
import { InflationService } from './inflation.service';
import { StatisticsSourcesController } from './statistics-sources.controller';
import { StatisticsSourcesService } from './statistics-sources.service';

@Module({
  controllers: [InflationController, StatisticsSourcesController],
  providers: [InflationService, StatisticsSourcesService],
  exports: [InflationService, StatisticsSourcesService],
})
export class InflationModule {}
