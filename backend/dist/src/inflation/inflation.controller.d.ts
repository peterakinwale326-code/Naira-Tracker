import { InflationService } from './inflation.service';
export declare class InflationController {
    private readonly inflationService;
    constructor(inflationService: InflationService);
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
    getLabourBreakdown(dimension?: string, metric?: string): Promise<void>;
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
    getHistoricalTrends(from?: string, to?: string): Promise<{
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
    calculatePurchasingPower(amount?: string, baseYear?: string, targetYear?: string): Promise<import("./inflation.service").PurchasingPowerResult>;
    getCommodityPrices(category?: string): Promise<{
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
    private parseYear;
}
