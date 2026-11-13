import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCorsOrigin } from './cors';
import { AppModule } from './app.module';

let appPromise: ReturnType<typeof createApp> | undefined;

async function createApp() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: getCorsOrigin(),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });
  await app.init();
  return app;
}

export async function handleVercelRequest(req: VercelRequest, res: VercelResponse) {
  appPromise ??= createApp();
  try {
    const app = await appPromise;
    const expressHandler = app.getHttpAdapter().getInstance() as (
      request: VercelRequest,
      response: VercelResponse,
    ) => void;
    return expressHandler(req, res);
  } catch (error) {
    appPromise = undefined;
    throw error;
  }
}
