import type { LogLevel } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';

/**
 * The HTTP application, set up the same way for the local server and the Vercel Function.
 * `logger` limits Nest's own log to these levels; left out, it logs everything.
 */
export async function createApp(logger?: LogLevel[]): Promise<NestExpressApplication> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger });
  app.disable('x-powered-by');
  return app;
}
