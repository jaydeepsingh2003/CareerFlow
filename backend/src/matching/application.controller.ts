import { Controller, Get, Post, Body, Query, Param, Put } from "@nestjs/common";
import { ApplicationService } from "./application.service";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("Applications")
@Controller("applications")
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get("me")
  @ApiOperation({ summary: "Get all my applications" })
  async getMyApplications(@Query("userId") userId: string) {
    return this.applicationService.getApplications(userId);
  }

  @Put("status")
  @ApiOperation({ summary: "Update application status" })
  async updateStatus(
    @Body() body: { userId: string; jobId: string; status: string },
  ) {
    return this.applicationService.updateStatus(
      body.userId,
      body.jobId,
      body.status,
    );
  }

  @Get("stats/:userId")
  @ApiOperation({ summary: "Get application stats for dashboard" })
  async getStats(@Param("userId") userId: string) {
    return this.applicationService.getStats(userId);
  }
}
