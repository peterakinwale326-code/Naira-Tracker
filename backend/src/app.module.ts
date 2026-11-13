import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { InflationModule } from './inflation/inflation.module';
import { AuthModule } from './auth/auth.module';
import { AssistantModule } from './assistant/assistant.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    InflationModule,
    AuthModule,
    AssistantModule,
  ],
})
export class AppModule {}
