import { Controller, Get } from "@nestjs/common";
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
  MicroserviceHealthIndicator,
} from "@nestjs/terminus";
import { PrismaService } from "../common/prisma/prisma.service";

@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
    private prismaHealth: PrismaHealthIndicator,
    private prismaService: PrismaService,
    // Add microservice checks if using queues/redis
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database check (Prisma)
      () => this.prismaHealth.pingCheck("database", this.prismaService as any),

      // External service connectivity check (e.g. Ollama if running)
      // () => this.http.pingCheck('ollama', 'http://localhost:11434'),

      // Memory check: fails if heap > 300MB usage (configurable)
      () => this.memory.checkHeap("memory_heap", 300 * 1024 * 1024),

      // Event loop lag check (responsiveness)
      // () => this.utils.checkEventLoop(),
    ]);
  }
}
