import { Injectable, Logger } from "@nestjs/common";
import * as CircuitBreaker from "opossum";

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private breakers: Map<string, CircuitBreaker> = new Map();

  getBreaker(
    key: string,
    action: (...args: any[]) => Promise<any>,
  ): CircuitBreaker {
    if (!this.breakers.has(key)) {
      const breaker = new CircuitBreaker(action, {
        timeout: 10000, // 10s
        errorThresholdPercentage: 50,
        resetTimeout: 30000, // 30s
      });

      breaker.on("open", () =>
        this.logger.warn(`Circuit Breaker OPEN: ${key}`),
      );
      breaker.on("halfOpen", () =>
        this.logger.log(`Circuit Breaker HALF-OPEN: ${key}`),
      );
      breaker.on("close", () =>
        this.logger.log(`Circuit Breaker CLOSED: ${key}`),
      );

      this.breakers.set(key, breaker);
    }
    return this.breakers.get(key);
  }

  async fire(
    key: string,
    action: (...args: any[]) => Promise<any>,
    ...args: any[]
  ): Promise<any> {
    const breaker = this.getBreaker(key, action);
    return breaker.fire(...args);
  }
}
