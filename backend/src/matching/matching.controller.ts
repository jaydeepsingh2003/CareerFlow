import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { MatchingService } from "./matching.service";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("matching")
@Controller("jobs")
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get("feed")
  @ApiOperation({ summary: "Get ranked job feed for a user" })
  async getFeed(
    @Query("userId") userId: string,
    @Query("limit") limit: number = 20,
    @Query("offset") offset: number = 0,
  ) {
    return this.matchingService.getRankedFeed(userId, limit, offset);
  }

  @Get("match")
  @ApiOperation({ summary: "Calculate match score for a specific job" })
  async calculateMatch(
    @Query("userId") userId: string,
    @Query("jobId") jobId: string,
  ) {
    return this.matchingService.getCandidateMatch(userId, jobId);
  }
}
