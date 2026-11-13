import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsSourcesService } from './statistics-sources.service';

@Controller('api/v1/statistics')
export class StatisticsSourcesController {
  constructor(private readonly sources: StatisticsSourcesService) {}

  @Get('sources')
  getSources() {
    return this.sources.getSourceDirectory();
  }

  @Get('nbs/cpi/releases')
  getNbsReleases() {
    return this.sources.getNbsCpiReleases();
  }

  @Get('world-bank')
  getWorldBank(
    @Query('indicator') indicator = 'FP.CPI.TOTL.ZG',
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.sources.getWorldBankIndicator(indicator, from, to);
  }

  @Get('un/cpi')
  getUnCpi(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.sources.getUnMonthlyCpi(from, to);
  }
}
