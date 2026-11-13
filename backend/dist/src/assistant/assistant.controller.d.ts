import { AssistantService } from './assistant.service';
export declare class AssistantController {
    private readonly assistant;
    constructor(assistant: AssistantService);
    chat(body: {
        message?: string;
        history?: Array<{
            role: 'user' | 'assistant';
            content: string;
        }>;
    }): Promise<{
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
