import { InflationService } from '../inflation/inflation.service';
import { StatisticsSourcesService } from '../inflation/statistics-sources.service';
type ChatTurn = {
    role: 'user' | 'assistant';
    content: string;
};
export declare class AssistantService {
    private readonly inflation;
    private readonly sources;
    private readonly logger;
    constructor(inflation: InflationService, sources: StatisticsSourcesService);
    private sourceContext;
    private getGeminiKeys;
    private getGeminiModels;
    private requestGemini;
    private answerWithGemini;
    private searchQueryFromAnswer;
    private searchWeb;
    private explicitWebSearchQuery;
    chat(message: string, history?: ChatTurn[]): Promise<{
        answer: string;
        provider: string;
        providerLabel: string;
        webSearchUsed: boolean;
        sources: any[];
        fallbackUsed?: undefined;
        attemptedFallbacks?: undefined;
    } | {
        answer: string;
        provider: string;
        providerLabel: string;
        webSearchUsed: boolean;
        sources: {
            title: string;
            url: string;
        }[];
        fallbackUsed: boolean;
        attemptedFallbacks: string[];
    } | {
        answer: string;
        provider: string;
        providerLabel: string;
        fallbackUsed: boolean;
        attemptedFallbacks: string[];
        webSearchUsed?: undefined;
        sources?: undefined;
    }>;
}
export {};
