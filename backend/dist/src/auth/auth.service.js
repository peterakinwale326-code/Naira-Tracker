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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
function getJwtSecret() {
    const secret = process.env.JWT_SECRET ||
        (process.env.NODE_ENV === 'production' ? undefined : 'naira-tracker-local-jwt-secret');
    if (!secret)
        throw new Error('JWT_SECRET must be configured in production.');
    return secret;
}
let AuthService = class AuthService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        await this.ensureBootstrapAdmin();
    }
    async ensureBootstrapAdmin() {
        const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
        if (!configuredAdminEmail) {
            if (process.env.NODE_ENV === 'production') {
                throw new Error('ADMIN_EMAIL must be configured in production.');
            }
            return;
        }
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword)
            throw new Error('ADMIN_PASSWORD must be configured when ADMIN_EMAIL is set.');
        const existing = await this.prisma.user.findUnique({ where: { email: configuredAdminEmail } });
        if (!existing) {
            const passwordHash = await bcrypt.hash(adminPassword, 10);
            await this.prisma.user.upsert({
                where: { email: configuredAdminEmail },
                create: {
                    email: configuredAdminEmail,
                    passwordHash,
                    name: 'System Administrator',
                    role: 'ADMIN',
                },
                update: { role: 'ADMIN' },
            });
            return;
        }
        if (process.env.NODE_ENV === 'production' && process.env.ADMIN_PASSWORD_RESET === 'true') {
            await this.prisma.user.update({
                where: { id: existing.id },
                data: {
                    role: 'ADMIN',
                    passwordHash: await bcrypt.hash(adminPassword, 10),
                },
            });
            return;
        }
        if (existing.role !== 'ADMIN') {
            await this.prisma.user.update({
                where: { id: existing.id },
                data: { role: 'ADMIN' },
            });
        }
    }
    async register(email, password, name) {
        if (!email || !password || !name)
            throw new common_1.BadRequestException('Email, password, and name are required');
        const cleanEmail = email.toLowerCase().trim();
        const existing = await this.prisma.user.findUnique({ where: { email: cleanEmail } });
        if (existing)
            throw new common_1.BadRequestException('An account with this email already exists');
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await this.prisma.user.create({
            data: { email: cleanEmail, passwordHash, name: name.trim() },
            select: { id: true, email: true, name: true, role: true, createdAt: true },
        });
        return { user, token: this.generateToken(user.id, user.email), message: 'Registration successful' };
    }
    async socialAuth(_provider, _email, _name) {
        throw new common_1.BadRequestException('Social sign-in is not configured.');
    }
    async login(email, password) {
        if (!email || !password)
            throw new common_1.BadRequestException('Email and password are required');
        const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (!user || !(await bcrypt.compare(password, user.passwordHash)))
            throw new common_1.UnauthorizedException('Invalid email or password credentials');
        return { user: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt }, token: this.generateToken(user.id, user.email), message: 'Login successful' };
    }
    async getProfile(tokenHeader) {
        const userId = this.verifyToken(tokenHeader);
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, role: true, createdAt: true, savedCalculations: { orderBy: { createdAt: 'desc' }, take: 10 } } });
        if (!user)
            throw new common_1.NotFoundException('User profile not found');
        return user;
    }
    async getAdminOverview(tokenHeader) {
        const userId = this.verifyToken(tokenHeader);
        const currentUser = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
        if (currentUser?.role !== 'ADMIN')
            throw new common_1.UnauthorizedException('Admin access required');
        const [userCount, adminCount, totalCalculations, recentUsers] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { role: 'ADMIN' } }),
            this.prisma.savedCalculation.count(),
            this.prisma.user.findMany({
                select: { id: true, email: true, name: true, role: true, createdAt: true },
                orderBy: { createdAt: 'desc' },
                take: 8,
            }),
        ]);
        return {
            userCount,
            adminCount,
            totalCalculations,
            recentUsers,
            generatedAt: new Date().toISOString(),
        };
    }
    async updateProfile(tokenHeader, name) {
        const userId = this.verifyToken(tokenHeader);
        const cleanName = typeof name === 'string' ? name.trim() : '';
        if (cleanName.length < 2 || cleanName.length > 80)
            throw new common_1.BadRequestException('Name must be between 2 and 80 characters.');
        return this.prisma.user.update({ where: { id: userId }, data: { name: cleanName }, select: { id: true, email: true, name: true, role: true, createdAt: true } });
    }
    async saveCalculation(tokenHeader, data) {
        const userId = this.verifyToken(tokenHeader);
        return this.prisma.savedCalculation.create({ data: { userId, title: data.title || '₦' + data.amount.toLocaleString() + ' (' + data.baseYear + ' vs ' + data.targetYear + ')', amount: data.amount, baseYear: data.baseYear, targetYear: data.targetYear, equivalentAmount: data.equivalentAmount, lossPercent: data.lossPercent } });
    }
    async getUserCalculations(tokenHeader) {
        const userId = this.verifyToken(tokenHeader);
        return this.prisma.savedCalculation.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    }
    generateToken(userId, email) { return jwt.sign({ sub: userId, email }, getJwtSecret(), { expiresIn: '7d' }); }
    verifyToken(tokenHeader) {
        if (!tokenHeader)
            throw new common_1.UnauthorizedException('Missing authentication token');
        const token = tokenHeader.replace(/^Bearer\s+/i, '').trim();
        try {
            return jwt.verify(token, getJwtSecret()).sub;
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired authentication token');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map