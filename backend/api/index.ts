import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let cachedServer: express.Express;

export const bootstrap = async () => {
  if (cachedServer) return cachedServer;

  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  
  await app.init();
  cachedServer = expressApp;
  return cachedServer;
};

const handler = async (req: any, res: any) => {
  const server = await bootstrap();
  return server(req, res);
};

export default handler;
