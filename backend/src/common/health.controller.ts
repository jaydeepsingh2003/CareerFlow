import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { PrismaService } from "./prisma/prisma.service";

@ApiTags("System")
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: "System health check" })
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: "ok",
        database: "connected",
        timestamp: new Date().toISOString(),
        version: "1.0.0-MVP",
        mode: "Lite (Mock AI Enabled)",
      };
    } catch (e) {
      return {
        status: "error",
        database: "disconnected",
        error: e.message,
      };
    }
  }
}
