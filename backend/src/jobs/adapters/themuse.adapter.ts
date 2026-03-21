import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import {
  JobSourceAdapter,
  FetchParams,
  NormalizedJob,
} from "./job-source.adapter";

@Injectable()
export class TheMuseAdapter implements JobSourceAdapter {
  private readonly logger = new Logger(TheMuseAdapter.name);
  private readonly BASE_URL = "https://www.themuse.com/api/public/jobs";

  async fetchJobs(params: FetchParams): Promise<NormalizedJob[]> {
    const { page, role } = params;

    const startTime = Date.now();
    try {
      const response = await axios.get(this.BASE_URL, {
        params: {
          page: page,
          category: role, // Category in TheMuse is roughly role
        },
        timeout: 5000,
      });

      const duration = Date.now() - startTime;
      const results = response.data.results || [];

      this.logger.log(
        `TheMuse fetch success: ${results.length} jobs in ${duration}ms`,
      );
      return results.map((job: any) => this.normalize(job));
    } catch (error) {
      this.logger.error(`TheMuse fetch failed: ${error.message}`);
      return [];
    }
  }

  private normalize(job: any): NormalizedJob {
    return {
      externalId: String(job.id),
      title: job.name,
      company: job.company?.name || "Unknown",
      location: job.locations?.[0]?.name || "Remote",
      description: job.contents || "",
      source: "THEMUSE",
      applyUrl: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.name + " " + (job.company?.name || ""))}&location=${encodeURIComponent(job.locations?.[0]?.name || "Remote")}`,
      postedAt: new Date(job.publication_date),
    };
  }
}
