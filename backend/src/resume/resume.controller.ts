import { Controller, Get, Post, Body, Param, Query } from "@nestjs/common";
import { ResumeService } from "./resume.service";

@Controller("resume")
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Post("create")
  create(@Body() data: any) {
    // In a real app, we'd get userId from auth decorator
    return this.resumeService.create(data.userId, data);
  }

  @Get("user/:userId")
  findByUser(@Param("userId") userId: string) {
    return this.resumeService.findByUserId(userId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.resumeService.findOne(id);
  }

  @Post("score")
  score(@Body() body: { resumeId: string; jobId: string }) {
    return this.resumeService.generateAssessment(body.resumeId, body.jobId);
  }
}
