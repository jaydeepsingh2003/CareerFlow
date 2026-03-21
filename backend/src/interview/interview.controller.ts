import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Patch,
} from "@nestjs/common";
import { InterviewService } from "./interview.service";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("Mock Interview")
@Controller("interview")
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post("start")
  @ApiOperation({ summary: "Start a new mock interview" })
  async start(
    @Body() body: { userId: string; jobId?: string; jobTitle?: string },
  ) {
    return this.interviewService.startInterview(
      body.userId,
      body.jobId,
      body.jobTitle,
    );
  }

  @Patch("answer")
  @ApiOperation({ summary: "Submit an answer to a question" })
  async submitAnswer(@Body() body: { questionId: string; answer: string }) {
    return this.interviewService.submitAnswer(body.questionId, body.answer);
  }

  @Post(":id/complete")
  @ApiOperation({
    summary: "Mark interview as completed and get final evaluation",
  })
  async complete(@Param("id") id: string) {
    return this.interviewService.completeInterview(id);
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Get interview history for a user" })
  async getHistory(@Param("userId") userId: string) {
    return this.interviewService.getHistory(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get details of a specific interview" })
  async getInterview(@Param("id") id: string) {
    return this.interviewService.getInterview(id);
  }
}
