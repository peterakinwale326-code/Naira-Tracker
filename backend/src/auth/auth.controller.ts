import { Controller, Post, Get, Patch, Body, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  async register(@Body() body: { email: string; password: string; name: string }) { return this.authService.register(body.email, body.password, body.name); }
  @Post('login')
  async login(@Body() body: { email: string; password: string }) { return this.authService.login(body.email, body.password); }
  @Post('social')
  async socialAuth(@Body() body: { provider: string; email: string; name: string }) { return this.authService.socialAuth(body.provider, body.email, body.name); }
  @Get('me')
  async getProfile(@Headers('authorization') authHeader?: string) { return this.authService.getProfile(authHeader); }
  @Get('admin/overview')
  async getAdminOverview(@Headers('authorization') authHeader?: string) { return this.authService.getAdminOverview(authHeader); }
  @Patch('me')
  async updateProfile(@Headers('authorization') authHeader: string, @Body() body: { name: string }) { return this.authService.updateProfile(authHeader, body.name); }
  @Post('calculations')
  async saveCalculation(@Headers('authorization') authHeader: string, @Body() body: { title: string; amount: number; baseYear: number; targetYear: number; equivalentAmount: number; lossPercent: number; }) { return this.authService.saveCalculation(authHeader, body); }
  @Get('calculations')
  async getCalculations(@Headers('authorization') authHeader: string) { return this.authService.getUserCalculations(authHeader); }
}
