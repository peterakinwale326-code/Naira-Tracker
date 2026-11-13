import { Module } from '@nestjs/common';
import { AssistantController } from './assistant.controller';
import { AssistantService } from './assistant.service';
import { InflationModule } from '../inflation/inflation.module';

@Module({
  imports: [InflationModule],
  controllers: [AssistantController],
  providers: [AssistantService],
})
export class AssistantModule {}
