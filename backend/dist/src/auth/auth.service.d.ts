import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService implements OnModuleInit {
    private readonly prisma;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private ensureBootstrapAdmin;
    register(email: string, password: string, name: string): Promise<{
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
    socialAuth(_provider: string, _email: string, _name: string): Promise<void>;
    login(email: string, password: string): Promise<{
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
    getProfile(tokenHeader?: string): Promise<{
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
    getAdminOverview(tokenHeader?: string): Promise<{
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
    updateProfile(tokenHeader: string, name: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: string;
        createdAt: Date;
    }>;
    saveCalculation(tokenHeader: string, data: {
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
    getUserCalculations(tokenHeader: string): Promise<{
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
    private generateToken;
    private verifyToken;
}
