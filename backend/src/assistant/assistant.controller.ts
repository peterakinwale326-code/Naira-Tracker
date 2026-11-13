import { Body, Controller, HttpCode, HttpStatus, Post, BadRequestException } from '@nestjs/common';
import { AssistantService } from './assistant.service';

@Controller('api/v1/assistant')
export class AssistantController {
  constructor(private readonly assistant: AssistantService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() body: { message?: string; history?: Array<{ role: 'user' | 'assistant'; content: string }> }) {
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    if (!message || message.length > 4000) {
      throw new BadRequestException('Message is required and must be no longer than 4,000 characters.');
    }
    const history = Array.isArray(body.history) ? body.history.slice(-24) : [];
    return this.assistant.chat(message, history);
  }
}
