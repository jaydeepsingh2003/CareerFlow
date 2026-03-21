import { Module } from "@nestjs/common";
import { JobsController } from "./jobs.controller";
import { JobsService } from "./jobs.service";
import { QueueModule } from "../queue/queue.module";
import { PrismaModule } from "../common/prisma/prisma.module";
import { AIModule } from "../ai/ai.module";
import { JobProcessor } from "./job.processor";
import { MatchingModule } from "../matching/matching.module";
import { JobIngestionService } from "./job-ingestion.service";
import { JobParserService } from "./job-parser.service";
import { DeduplicationService } from "./deduplication.service";
import { JobAggregatorService } from "./job-aggregator.service";
import { AdzunaAdapter } from "./adapters/adzuna.adapter";
import { TheMuseAdapter } from "./adapters/themuse.adapter";
import { RapidApiAdapter } from "./adapters/rapid-api.adapter";
import { RecurringJobService } from "./recurring-job.service";
import { CircuitBreakerService } from "../common/circuit-breaker.service";

@Module({
  imports: [QueueModule, PrismaModule, AIModule, MatchingModule],
  controllers: [JobsController],
  providers: [
    JobsService,
    JobProcessor,
    JobIngestionService,
    JobParserService,
    DeduplicationService,
    JobAggregatorService,
    AdzunaAdapter,
    TheMuseAdapter,
    RapidApiAdapter,
    RecurringJobService,
    CircuitBreakerService,
  ],
  exports: [JobAggregatorService, JobIngestionService],
})
export class JobsModule {}
