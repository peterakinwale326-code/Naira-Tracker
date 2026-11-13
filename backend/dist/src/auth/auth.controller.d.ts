import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: {
        email: string;
        password: string;
        name: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            createdAt: Date;
        };
        token: string;
        message: string;
    }>;
    login(body: {
        email: string;
        password: string;
    }): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: string;
            createdAt: Date;
        };
        token: string;
        message: string;
    }>;
    socialAuth(body: {
        provider: string;
        email: string;
        name: string;
    }): Promise<void>;
    getProfile(authHeader?: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        createdAt: Date;
        savedCalculations: {
            id: string;
            createdAt: Date;
            userId: string;
            title: string;
            amount: number;
            baseYear: number;
            targetYear: number;
            equivalentAmount: number;
            lossPercent: number;
        }[];
    }>;
    getAdminOverview(authHeader?: string): Promise<{
        userCount: number;
        adminCount: number;
        totalCalculations: number;
        recentUsers: {
            id: string;
            email: string;
            name: string;
            role: string;
            createdAt: Date;
        }[];
        generatedAt: string;
    }>;
    updateProfile(authHeader: string, body: {
        name: string;
    }): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        createdAt: Date;
    }>;
    saveCalculation(authHeader: string, body: {
        title: string;
        amount: number;
        baseYear: number;
        targetYear: number;
        equivalentAmount: number;
        lossPercent: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        amount: number;
        baseYear: number;
        targetYear: number;
        equivalentAmount: number;
        lossPercent: number;
    }>;
    getCalculations(authHeader: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        amount: number;
        baseYear: number;
        targetYear: number;
        equivalentAmount: number;
        lossPercent: number;
    }[]>;
}
