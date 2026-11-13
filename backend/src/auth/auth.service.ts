import { Injectable, BadRequestException, UnauthorizedException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET ||
    (process.env.NODE_ENV === 'production' ? undefined : 'naira-tracker-local-jwt-secret');
  if (!secret) throw new Error('JWT_SECRET must be configured in production.');
  return secret;
}

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureBootstrapAdmin();
  }

  private async ensureBootstrapAdmin() {
    const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (!configuredAdminEmail) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('ADMIN_EMAIL must be configured in production.');
      }
      return;
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) throw new Error('ADMIN_PASSWORD must be configured when ADMIN_EMAIL is set.');

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

  async register(email: string, password: string, name: string) {
    if (!email || !password || !name) throw new BadRequestException('Email, password, and name are required');
    const cleanEmail = email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) throw new BadRequestException('An account with this email already exists');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { email: cleanEmail, passwordHash, name: name.trim() },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return { user, token: this.generateToken(user.id, user.email), message: 'Registration successful' };
  }
  async socialAuth(_provider: string, _email: string, _name: string) {
    throw new BadRequestException('Social sign-in is not configured.');
  }
  async login(email: string, password: string) {
    if (!email || !password) throw new BadRequestException('Email and password are required');
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new UnauthorizedException('Invalid email or password credentials');
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role, createdAt: user.createdAt }, token: this.generateToken(user.id, user.email), message: 'Login successful' };
  }
  async getProfile(tokenHeader?: string) {
    const userId = this.verifyToken(tokenHeader);
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, role: true, createdAt: true, savedCalculations: { orderBy: { createdAt: 'desc' }, take: 10 } } });
    if (!user) throw new NotFoundException('User profile not found');
    return user;
  }
  async getAdminOverview(tokenHeader?: string) {
    const userId = this.verifyToken(tokenHeader);
    const currentUser = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (currentUser?.role !== 'ADMIN') throw new UnauthorizedException('Admin access required');

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
  async updateProfile(tokenHeader: string, name: string) {
    const userId = this.verifyToken(tokenHeader);
    const cleanName = typeof name === 'string' ? name.trim() : '';
    if (cleanName.length < 2 || cleanName.length > 80) throw new BadRequestException('Name must be between 2 and 80 characters.');
    return this.prisma.user.update({ where: { id: userId }, data: { name: cleanName }, select: { id: true, email: true, name: true, role: true, createdAt: true } });
  }
  async saveCalculation(tokenHeader: string, data: { title: string; amount: number; baseYear: number; targetYear: number; equivalentAmount: number; lossPercent: number; }) {
    const userId = this.verifyToken(tokenHeader);
    return this.prisma.savedCalculation.create({ data: { userId, title: data.title || '₦' + data.amount.toLocaleString() + ' (' + data.baseYear + ' vs ' + data.targetYear + ')', amount: data.amount, baseYear: data.baseYear, targetYear: data.targetYear, equivalentAmount: data.equivalentAmount, lossPercent: data.lossPercent } });
  }
  async getUserCalculations(tokenHeader: string) {
    const userId = this.verifyToken(tokenHeader);
    return this.prisma.savedCalculation.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }
  private generateToken(userId: string, email: string): string { return jwt.sign({ sub: userId, email }, getJwtSecret(), { expiresIn: '7d' }); }
  private verifyToken(tokenHeader?: string): string {
    if (!tokenHeader) throw new UnauthorizedException('Missing authentication token');
    const token = tokenHeader.replace(/^Bearer\s+/i, '').trim();
    try { return (jwt.verify(token, getJwtSecret()) as { sub: string }).sub; }
    catch { throw new UnauthorizedException('Invalid or expired authentication token'); }
  }
}
