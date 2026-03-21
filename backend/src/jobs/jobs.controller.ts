import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Logger,
  Query,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { JobsService } from "./jobs.service";
import { MatchingService } from "../matching/matching.service";
import { JobIngestionService } from "./job-ingestion.service";
import { ImportJobDto, CreateJobDto } from "./dto/create-job.dto";
import { ApplicationService } from "../matching/application.service";

@ApiTags("Jobs")
@Controller("jobs")
export class JobsController {
  private readonly logger = new Logger(JobsController.name);

  constructor(
    private readonly jobsService: JobsService,
    private readonly matchingService: MatchingService,
    private readonly ingestionService: JobIngestionService,
    private readonly applicationService: ApplicationService,
  ) {}

  @Get("feed")
  @ApiOperation({ summary: "Get personalized job feed" })
  async getFeed(
    @Query("userId") userId: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20,
    @Query("role") role?: string,
    @Query("location") location?: string,
    @Query("skills") skills?: string,
    @Query("salary") salary?: string,
    @Query("source") source?: string,
  ) {
    this.logger.log(
      `Fetching feed [${userId || "Guest"}] Roles: ${role}, Location: ${location}`,
    );
    const offset = (page - 1) * limit;

    // Dynamic Real-time Ingestion
    if (role || location) {
      this.ingestionService
        .ingestAll(role, location)
        .catch((err) =>
          this.logger.error(`Background ingestion failed: ${err.message}`),
        );
    } else {
      // Auto-seed if DB is low on data
      this.jobsService
        .count()
        .then((count) => {
          if (count < 5)
            this.ingestionService.ingestAll("software engineer", "remote");
        })
        .catch(() => null);
    }

    if (!userId) {
      const result = await this.jobsService.findAll(
        { role, location, skills, salary },
        page,
        limit,
      );
      return {
        jobs: result.jobs,
        pagination: {
          total: result.total,
          limit: Number(limit),
          page: Number(page),
        },
      };
    }

    return this.matchingService.getRankedFeed(
      userId,
      Number(limit),
      Number(offset),
      { role, location, source, skills, salary },
    );
  }

  @Get("filter-options")
  @ApiOperation({ summary: "Get dynamic filter options for roles and skills" })
  async getFilterOptions() {
    return this.jobsService.getFilterOptions();
  }

  @Post("ingest-all")
  @ApiOperation({ summary: "Trigger job ingestion worker" })
  async ingestAll(
    @Query("query") query: string,
    @Query("location") location: string,
  ) {
    return this.ingestionService.ingestAll(query, location);
  }

  @Post("import")
  @ApiOperation({ summary: "Import job from URL" })
  async importJob(@Body() body: ImportJobDto, @Query("userId") userId: string) {
    // Redirection to ingestion service
    return { message: "Import logic redirected to ingestion service" };
  }

  @Post(":id/apply")
  @ApiOperation({ summary: "Part 10: Logic for application" })
  async apply(@Param("id") id: string, @Query("userId") userId: string) {
    this.logger.log(`Architect Flow: Recording application for ${id}`);
    // Implementation logic moved to ApplicationService updateStatus
    return this.applicationService.updateStatus(
      userId,
      id,
      "APPLIED",
      "KODNEST",
    );
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.jobsService.findOne(id);
  }
}
