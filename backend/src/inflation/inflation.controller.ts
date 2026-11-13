import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { InflationService } from './inflation.service';

@Controller('api/v1/inflation')
export class InflationController {
  constructor(private readonly inflationService: InflationService) {}

  @Get('datasets')
  async getDatasetCatalog() {
    return this.inflationService.getDatasetCatalog();
  }

  @Get('labour/breakdown')
  async getLabourBreakdown(
    @Query('dimension') dimension?: string,
    @Query('metric') metric?: string,
  ) {
    return this.inflationService.getLabourBreakdown(dimension || 'sex', metric || 'unemployment_rate');
  }

  @Get('labour/methodologies')
  async getLabourMethodologies() {
    return this.inflationService.getLabourMethodologies();
  }

  @Get('latest')
  async getLatestMetrics() {
    return this.inflationService.getLatestMetrics();
  }

  @Get('trends')
  async getHistoricalTrends(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fromYear = this.parseYear(from);
    const toYear = this.parseYear(to);
    if (fromYear && toYear && fromYear > toYear) {
      throw new BadRequestException('The start year must not be later than the end year.');
    }
    return this.inflationService.getHistoricalTrends(fromYear, toYear);
  }

  @Get('calculate')
  async calculatePurchasingPower(
    @Query('amount') amount?: string,
    @Query('baseYear') baseYear?: string,
    @Query('targetYear') targetYear?: string,
  ) {
    const parsedAmount = amount === undefined ? Number.NaN : Number(amount);
    const parsedBaseYear = this.parseYear(baseYear);
    const parsedTargetYear = this.parseYear(targetYear);

    return this.inflationService.calculatePurchasingPower(
      parsedAmount,
      parsedBaseYear ?? Number.NaN,
      parsedTargetYear,
    );
  }

  @Get('commodities')
  async getCommodityPrices(@Query('category') category?: string) {
    return this.inflationService.getCommodityAverages(category);
  }

  private parseYear(value?: string) {
    if (value === undefined) return undefined;
    const year = Number(value);
    if (!Number.isInteger(year) || year < 1990 || year > new Date().getFullYear()) {
      throw new BadRequestException('Years must be whole numbers between 1990 and the current year.');
    }
    return year;
  }
}
