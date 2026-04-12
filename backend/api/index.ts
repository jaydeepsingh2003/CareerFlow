console.log("[LIFECYCLE] Vercel index.ts loading starting...");
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

export const bootstrap = async (res?: any) => {
  if (cachedServer) return cachedServer;

  // Environment Check
  if (!process.env.DATABASE_URL) {
    if (res) {
        return res.status(200).json({ 
            status: "MISSING_CONFIG", 
            message: "DATABASE_URL is not set in Vercel. Please add it to your Project Settings -> Environment Variables.",
            instruction: "Get your Service URI from Aiven and add it as DATABASE_URL"
        });
    }
    throw new Error("DATABASE_URL is missing");
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
  if (req.url === "/api/health-check-raw" || req.url === "/health-check-raw") {
    return res.status(200).json({ status: "ok", message: "Vercel handler is alive" });
  }

  try {
    const result = await bootstrap(res);
    
    // The express app is a function (req, res)
    if (typeof result === 'function') {
      return result(req, res);
    }
    // If we reach here and it's not a function, bootstrap already handled the response (e.g. missing config)
    return;
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
