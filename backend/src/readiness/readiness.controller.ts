import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ReadinessService } from "./readiness.service";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Assume this exists or use placeholder

@ApiTags("readiness")
@Controller("readiness")
export class ReadinessController {
  constructor(private readonly readinessService: ReadinessService) {}

  @Post("generate")
  @ApiOperation({ summary: "Generate preparation plan for a job" })
  async generate(@Body() body: { userId: string; jobId: string }) {
    return this.readinessService.generatePlan(body.userId, body.jobId);
  }

  @Get("score/:userId")
  @ApiOperation({ summary: "Get readiness score for a user" })
  async getScore(@Param("userId") userId: string) {
    return this.readinessService.getScore(userId);
  }

  @Get("plan/:userId")
  @ApiOperation({ summary: "Get latest readiness plan for a user" })
  async getPlan(@Param("userId") userId: string) {
    return this.readinessService.getLatestPlan(userId);
  }
}
