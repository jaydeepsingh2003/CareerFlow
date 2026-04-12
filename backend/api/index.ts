import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

// Global Exception Handlers for Serverless
process.on('unhandledRejection', (reason, promise) => {
  console.error('[FATAL] Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err);
});

let cachedServer: express.Express;

export const bootstrap = async () => {
  if (cachedServer) return cachedServer;

  // Environment Check
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in Vercel environment variables. Backend cannot start.");
  }

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
  // Raw Health Check Bypass
  if (req.url === "/api/health-check-raw") {
    return res.status(200).json({ status: "ok", message: "Vercel handler is alive" });
  }

  try {
    const server = await bootstrap();
    return server(req, res);
  } catch (error) {
    console.error("[Vercel-Handler] Fatal bootstrap error:", error);
    res.status(500).json({
      error: "Internal Server Error during bootstrap",
      message: error instanceof Error ? error.message : String(error),
      stack: process.env.NODE_ENV === "development" ? (error as any)?.stack : undefined,
    });
  }
};

export default handler;
