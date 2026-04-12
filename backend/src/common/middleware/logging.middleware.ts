import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP");

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const userAgent = req.get("user-agent") || "";
    const requestId = randomUUID();

    // Attach request ID to response headers
    res.setHeader("X-Request-ID", requestId);

    const start = Date.now();

    res.on("finish", () => {
      const { statusCode } = res;
      const contentLength = res.get("content-length");
      const duration = Date.now() - start;

      this.logger.log(
        `[${requestId}] ${method} ${originalUrl} ${statusCode} ${contentLength}b - ${duration}ms`,
      );

      // Log memory usage periodically or on high load requests
      if (duration > 1000) {
        const memoryUsage = process.memoryUsage();
        this.logger.warn(
          `[${requestId}] High Latency Request. Memory: RSS=${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        );
      }
    });

    next();
  }
}
