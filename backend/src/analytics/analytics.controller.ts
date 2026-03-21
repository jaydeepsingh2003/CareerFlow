import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.service";

@ApiTags("Analytics")
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("system-stats")
  @ApiOperation({ summary: "Get global system statistics" })
  async getSystemStats() {
    return this.analyticsService.getSystemStats();
  }

  @Get("match-distribution")
  @ApiOperation({ summary: "Get match score distribution" })
  async getMatchDistribution() {
    return this.analyticsService.getMatchScoreDistribution();
  }

  @Get("dashboard/:userId")
  @ApiOperation({ summary: "Get career dashboard data" })
  async getDashboard(@Param("userId") userId: string) {
    return this.analyticsService.getUserDashboard(userId);
  }

  @Get("user-activity/:userId")
  @ApiOperation({ summary: "Get real-time user activity history" })
  async getUserActivity(@Param("userId") userId: string) {
    return this.analyticsService.getUserActivity(userId);
  }
}
