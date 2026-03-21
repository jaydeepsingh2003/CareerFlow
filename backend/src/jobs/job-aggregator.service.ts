import { Injectable, Logger } from "@nestjs/common";
import { AdzunaAdapter } from "./adapters/adzuna.adapter";
import { TheMuseAdapter } from "./adapters/themuse.adapter";
import { RapidApiAdapter } from "./adapters/rapid-api.adapter";
import { NormalizedJob } from "./adapters/job-source.adapter";
import { CircuitBreakerService } from "../common/circuit-breaker.service";

@Injectable()
export class JobAggregatorService {
  private readonly logger = new Logger(JobAggregatorService.name);

  constructor(
    private readonly adzuna: AdzunaAdapter,
    private readonly theMuse: TheMuseAdapter,
    private readonly rapidApi: RapidApiAdapter,
    private readonly cb: CircuitBreakerService,
  ) {}

  async fetchAll(query: string, location: string): Promise<NormalizedJob[]> {
    const roles = query.split(",").map((r) => r.trim());
    this.logger.log(
      `Starting resilient aggregation for roles: [${roles.join(", ")}] @ ${location}`,
    );

    const tasks: Promise<any>[] = [];

    for (const role of roles) {
      // Adzuna Tasks
      tasks.push(
        this.cb.fire("adzuna", (p: any) => this.adzuna.fetchJobs(p), {
          page: 1,
          role,
          location,
        }),
      );
      tasks.push(
        this.cb.fire("adzuna", (p: any) => this.adzuna.fetchJobs(p), {
          page: 2,
          role,
          location,
        }),
      );

      // TheMuse Tasks
      tasks.push(
        this.cb.fire("themuse", (p: any) => this.theMuse.fetchJobs(p), {
          page: 1,
          role,
          location,
        }),
      );
      tasks.push(
        this.cb.fire("themuse", (p: any) => this.theMuse.fetchJobs(p), {
          page: 2,
          role,
          location,
        }),
      );

      // RapidAPI Tasks
      tasks.push(
        this.cb.fire("rapidapi", (p: any) => this.rapidApi.fetchJobs(p), {
          page: 1,
          role,
          location,
        }),
      );
    }

    const results = await Promise.allSettled(tasks);
    const allJobs: NormalizedJob[] = [];

    results.forEach((res, i) => {
      if (res.status === "fulfilled") {
        allJobs.push(...res.value);
      } else {
        this.logger.error(`Task ${i} failed or circuit open: ${res.reason}`);
      }
    });

    // Deduplication in-memory before returning to ingestion service
    const uniqueJobs = Array.from(
      new Map(allJobs.map((j) => [j.externalId, j])).values(),
    );
    this.logger.log(
      `Aggregation finished. Found ${uniqueJobs.length} unique candidates across all sources.`,
    );

    return uniqueJobs;
  }
}
