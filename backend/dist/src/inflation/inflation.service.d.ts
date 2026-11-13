import { PrismaService } from '../prisma/prisma.service';
import { StatisticsSourcesService } from './statistics-sources.service';
export interface PurchasingPowerResult {
    baseYear: number;
    targetYear: number;
    initialAmount: number;
    equivalentToday: number;
    purchasingPowerLossPercent: number;
    compoundedInflationRate: number;
    realResidualValue: number;
}
export declare class InflationService {
    private readonly prisma;
    private readonly statistics;
    private readonly logger;
    constructor(prisma: PrismaService, statistics: StatisticsSourcesService);
    private unHistory;
    getDatasetCatalog(): Promise<{
        primary: {
            name: string;
            role: string;
            url: string;
            access: string;
        };
        secondary: {
            name: string;
            role: string;
            url: string;
            access: string;
        }[];
        methodology: string;
    }>;
    getLabourBreakdown(_dimension?: string, _metric?: string): Promise<void>;
    getLabourMethodologies(): Promise<{
        available: boolean;
        message: string;
    }>;
    getLatestMetrics(): Promise<{
        year: number;
        month: number;
        period: string;
        cpiYearOverYearRate: number;
        cpiMonthOverMonthRate: number;
        foodRate: any;
        coreRate: any;
        cpiIndex: number;
        source: string;
        sourceAgency: string;
        sourceUrl: string;
        publicationDate: any;
        sourceRelease: any;
        indexBase: string;
        foodRateAvailable: boolean;
        coreRateAvailable: boolean;
        retrievedAt: string;
        methodologyNote: string;
    }>;
    getHistoricalTrends(fromYear?: number, toYear?: number): Promise<{
        period: string;
        year: number;
        month: number;
        cpiYearOverYearRate: number;
        cpiMonthOverMonthRate: number;
        foodRate: any;
        coreRate: any;
        cpiIndex: number;
        source: string;
        indexBase: string;
        sourceUrl: string;
    }[]>;
    getCommodityAverages(category?: string): Promise<{
        sourceUrl: string | null;
        id: string;
        itemName: string;
        category: string;
        price: number;
        unit: string;
        marketState: string;
        recordDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    calculatePurchasingPower(amount: number, baseYear: number, targetYear?: number): Promise<PurchasingPowerResult>;
    handleMonthlyIngestion(): Promise<void>;
}
