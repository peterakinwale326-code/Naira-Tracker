export declare class StatisticsSourcesService {
    private cache;
    private cached;
    private getText;
    getNbsCpiReleases(): Promise<{
        source: string;
        dataset: string;
        catalogUrl: string;
        retrievedAt: string;
        releases: {
            title: string;
            downloadUrl: string;
        }[];
        note: string;
    }>;
    getWorldBankIndicator(indicator: string, from?: string, to?: string): Promise<{
        source: string;
        sourceUrl: string;
        indicator: any;
        country: string;
        frequency: string;
        retrievedAt: string;
        observations: {
            year: number;
            value: any;
            unit: any;
            observationStatus: any;
        }[];
    }>;
    getUnMonthlyCpi(fromYear?: string, toYear?: string): Promise<{
        source: string;
        sourceUrl: string;
        seriesCode: string;
        countryCode: string;
        indexBase: string;
        fromYear: number;
        toYear: number;
        retrievedAt: string;
        observations: {
            period: string;
            year: number;
            month: number;
            cpiIndex: number;
            source: string;
            indexBase: string;
            footnoteRefs: string[];
        }[];
        footnotes: {
            code: string;
            text: string;
        }[];
        dataXml: string;
        note: string;
    }>;
    getSourceDirectory(): Promise<{
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
}
