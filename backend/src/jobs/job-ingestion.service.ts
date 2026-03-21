import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { DeduplicationService } from "./deduplication.service";
import { AIService } from "../ai/ai.service";
import { JobAggregatorService } from "./job-aggregator.service";
import { NormalizedJob } from "./adapters/job-source.adapter";

@Injectable()
export class JobIngestionService {
  private readonly logger = new Logger(JobIngestionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly dedup: DeduplicationService,
    private readonly aiService: AIService,
    private readonly aggregator: JobAggregatorService,
  ) {}

  async ingestAll(
    query: string = "software engineer",
    location: string = "remote",
  ) {
    const startTime = Date.now();
    this.logger.log(`Starting production ingestion worker for ${query}...`);

    // 1. Fetch & Normalize
    const jobs = await this.aggregator.fetchAll(query, location);
    this.logger.log(`Fetched ${jobs.length} normalized candidates.`);

    let inserted = 0;
    let skipped = 0;

    for (const job of jobs) {
      try {
        // 2. Hash-based Deduplication
        const jobHash = this.dedup.generateHash(
          job.title,
          job.company,
          job.location,
        );

        // 3. Fallback Heuristic for immediate filter support
        const detectedSkills = this.extractSkillsHeuristic(
          `${job.title} ${job.description}`,
        );

        // 4. Two-Level Deduplication
        const duplicate = await this.dedup.findDuplicate(
          job.externalId,
          jobHash,
          undefined,
        );
        if (duplicate) {
          skipped++;
          continue;
        }

        // 5. Database Insert
        const saved = await this.prisma.jobPosting.create({
          data: {
            externalId: job.externalId,
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            salary: job.salary,
            source: job.source,
            applyUrl: job.applyUrl,
            postedAt: job.postedAt,
            jobHash: jobHash,
            status: "OPEN",
            requirements: JSON.stringify(detectedSkills),
          },
        });

        // 6. Qdrant Store
        await this.aiService.storeJobEmbedding(
          saved.id,
          `${job.title} ${job.description}`,
        );

        // 7. Async: Trigger deep analysis
        this.aiService
          .analyzeJobDescription(saved.id, job.description)
          .catch((err) =>
            this.logger.error(
              `AI Analysis failed for ${saved.id}: ${err.message}`,
            ),
          );

        inserted++;
      } catch (error) {
        this.logger.error(
          `Failed to process job ${job.externalId}: ${error.message}`,
        );
      }
    }

    const duration = Date.now() - startTime;
    this.logger.log(
      `Ingestion Complete! [Inserted: ${inserted}, Skipped/Dup: ${skipped}, Duration: ${duration}ms]`,
    );

    return { inserted, skipped, duration };
  }

  private extractSkillsHeuristic(text: string): string[] {
    const skills = [
      "React",
      "Node",
      "Python",
      "Java",
      "JavaScript",
      "AWS",
      "Docker",
      "SQL",
      "TypeScript",
      "Next.js",
      "PostgreSQL",
      "Redis",
      "Kubernetes",
    ];
    return skills.filter((s) => text.toLowerCase().includes(s.toLowerCase()));
  }
}
