import * as CircuitBreaker from "opossum";
import { Logger } from "@nestjs/common";

const logger = new Logger("CircuitBreaker");

export function createCircuitBreaker(
  action: any,
  options?: CircuitBreaker.Options,
) {
  const breaker = new CircuitBreaker(action, {
    timeout: 5000, // If function takes longer than 5 seconds, trigger failure
    errorThresholdPercentage: 50, // When 50% of requests fail, open the circuit
    resetTimeout: 10000, // After 10 seconds, try again.
    ...options,
  });

  breaker.fallback(() => ({ error: "Service Unavailable (Circuit Open)" }));

  breaker.on("open", () =>
    logger.warn(`Circuit Breaker OPEN for function: ${action.name}`),
  );
  breaker.on("halfOpen", () =>
    logger.log(`Circuit Breaker HALF-OPEN check for: ${action.name}`),
  );
  breaker.on("close", () =>
    logger.log(`Circuit Breaker CLOSED for: ${action.name}`),
  );

  return breaker;
}
