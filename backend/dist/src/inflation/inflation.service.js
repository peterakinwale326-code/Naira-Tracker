"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var InflationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InflationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const statistics_sources_service_1 = require("./statistics-sources.service");
function percentageChange(current, previous) {
    return Number((((current / previous) - 1) * 100).toFixed(2));
}
let InflationService = InflationService_1 = class InflationService {
    constructor(prisma, statistics) {
        this.prisma = prisma;
        this.statistics = statistics;
        this.logger = new common_1.Logger(InflationService_1.name);
    }
    async unHistory(fromYear, toYear) {
        const currentYear = new Date().getFullYear();
        const result = await this.statistics.getUnMonthlyCpi(String(fromYear || Math.max(1990, currentYear - 15)), String(toYear || currentYear));
        const observations = result.observations;
        if (!observations?.length) {
            throw new common_1.ServiceUnavailableException('The UN Statistics Division returned no parseable monthly CPI observations. No substitute figures are displayed.');
        }
        return observations.filter(row => (!fromYear || row.year >= fromYear) && (!toYear || row.year <= toYear)).sort((a, b) => a.period.localeCompare(b.period));
    }
    async getDatasetCatalog() {
        return this.statistics.getSourceDirectory();
    }
    async getLabourBreakdown(_dimension = 'sex', _metric = 'unemployment_rate') {
        throw new common_1.ServiceUnavailableException('Labour breakdown data is not connected to a verified source yet. No estimated figures are displayed.');
    }
    async getLabourMethodologies() {
        return {
            available: false,
            message: 'Labour methodology documents have not yet been connected to a verified source.',
        };
    }
    async getLatestMetrics() {
        const rows = await this.unHistory();
        const latest = rows[rows.length - 1];
        const previous = rows.find(row => row.year === (latest.year - 1) && row.month === latest.month);
        const priorMonth = rows.length > 1 ? rows[rows.length - 2] : undefined;
        const yoy = previous && latest.year >= 2026 && previous.indexBase === latest.indexBase
            ? percentageChange(latest.cpiIndex, previous.cpiIndex)
            : null;
        const mom = priorMonth && latest.period !== '2025-01' && priorMonth.indexBase === latest.indexBase
            ? percentageChange(latest.cpiIndex, priorMonth.cpiIndex)
            : null;
        return {
            year: latest.year,
            month: latest.month,
            period: latest.period,
            cpiYearOverYearRate: yoy,
            cpiMonthOverMonthRate: mom,
            foodRate: null,
            coreRate: null,
            cpiIndex: latest.cpiIndex,
            source: 'United Nations Statistics Division – Monthly Bulletin of Statistics',
            sourceAgency: 'United Nations Statistics Division',
            sourceUrl: 'https://unstats.un.org/unsd/mbs/app/DataView.aspx?cid=566&p=A&tid=6&yearfrom=1997&yearto=2099',
            publicationDate: null,
            sourceRelease: null,
            indexBase: latest.indexBase,
            foodRateAvailable: false,
            coreRateAvailable: false,
            retrievedAt: new Date().toISOString(),
            methodologyNote: 'CPI percentage changes are calculated from the UN monthly index only when comparable observations are available. The January 2025 series break is not crossed. NBS food and core rates are not inferred.',
        };
    }
    async getHistoricalTrends(fromYear, toYear) {
        const rows = await this.unHistory(fromYear ? Math.max(1990, fromYear - 1) : undefined, toYear);
        return rows.map((row, index) => {
            const priorMonth = index > 0 ? rows[index - 1] : undefined;
            const priorYear = rows.find(item => item.year === row.year - 1 && item.month === row.month);
            const comparablePriorMonth = priorMonth && priorMonth.indexBase === row.indexBase;
            const comparablePriorYear = priorYear && priorYear.indexBase === row.indexBase;
            return {
                period: row.period,
                year: row.year,
                month: row.month,
                cpiYearOverYearRate: comparablePriorYear && row.year >= 2026
                    ? percentageChange(row.cpiIndex, priorYear.cpiIndex)
                    : null,
                cpiMonthOverMonthRate: comparablePriorMonth && row.period !== '2025-01'
                    ? percentageChange(row.cpiIndex, priorMonth.cpiIndex)
                    : null,
                foodRate: null,
                coreRate: null,
                cpiIndex: row.cpiIndex,
                source: row.source,
                indexBase: row.indexBase,
                sourceUrl: 'https://unstats.un.org/unsd/mbs/app/DataView.aspx?cid=566&p=A&tid=6&yearfrom=1997&yearto=2099',
            };
        }).filter(row => !fromYear || row.year >= fromYear);
    }
    async getCommodityAverages(category) {
        const verifiedSince = new Date();
        verifiedSince.setDate(verifiedSince.getDate() - 90);
        return this.prisma.commodityPrice.findMany({
            where: {
                ...(category ? { category } : {}),
                recordDate: { gte: verifiedSince },
                sourceUrl: { not: null },
            },
            orderBy: { recordDate: 'desc' }, take: 50,
        });
    }
    async calculatePurchasingPower(amount, baseYear, targetYear) {
        if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(baseYear) || (targetYear !== undefined && !Number.isInteger(targetYear))) {
            throw new common_1.BadRequestException('Enter a valid positive amount and whole-number years.');
        }
        if (baseYear < 2025) {
            throw new common_1.ServiceUnavailableException('The UN CPI series has a marked break in January 2025. Purchasing-power comparisons are only supported within the post-break series from 2025 onward.');
        }
        const latest = await this.getLatestMetrics();
        const resolvedTargetYear = targetYear ?? latest.year;
        if (resolvedTargetYear <= baseYear) {
            throw new common_1.BadRequestException('The target year must be later than the base year.');
        }
        if (resolvedTargetYear > latest.year) {
            throw new common_1.BadRequestException('The target year cannot be later than the latest available CPI observation.');
        }
        const trends = await this.getHistoricalTrends(baseYear, resolvedTargetYear);
        const baseData = trends.filter(row => row.year === baseYear).sort((a, b) => b.month - a.month)[0];
        const targetData = trends.filter(row => row.year === resolvedTargetYear).sort((a, b) => b.month - a.month)[0];
        if (!baseData?.cpiIndex || !targetData?.cpiIndex) {
            throw new common_1.NotFoundException('UN CPI index observations are unavailable for the selected years.');
        }
        const baseCpi = baseData.cpiIndex, targetCpi = targetData.cpiIndex;
        if (baseData.indexBase !== targetData.indexBase) {
            throw new common_1.ServiceUnavailableException('The selected years use different CPI index bases and cannot be compared.');
        }
        const equivalentToday = amount * targetCpi / baseCpi;
        const realResidualValue = amount * baseCpi / targetCpi;
        return {
            baseYear, targetYear: resolvedTargetYear, initialAmount: amount,
            equivalentToday: Math.round(equivalentToday * 100) / 100,
            purchasingPowerLossPercent: Math.round(((amount - realResidualValue) / amount) * 1000) / 10,
            compoundedInflationRate: Math.round(((targetCpi - baseCpi) / baseCpi) * 1000) / 10,
            realResidualValue: Math.round(realResidualValue * 100) / 100,
        };
    }
    async handleMonthlyIngestion() {
        this.logger.log('Refreshing the independent UN monthly CPI reference series.');
        try {
            await this.getLatestMetrics();
        }
        catch (err) {
            this.logger.error('UN CPI refresh failed; no replacement figures will be published.', err);
        }
    }
};
exports.InflationService = InflationService;
exports.InflationService = InflationService = InflationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        statistics_sources_service_1.StatisticsSourcesService])
], InflationService);
//# sourceMappingURL=inflation.service.js.map