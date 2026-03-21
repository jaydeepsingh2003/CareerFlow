import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import {
  JobSourceAdapter,
  FetchParams,
  NormalizedJob,
} from "./job-source.adapter";

@Injectable()
export class AdzunaAdapter implements JobSourceAdapter {
  private readonly logger = new Logger(AdzunaAdapter.name);
  private readonly APP_ID = process.env.ADZUNA_APP_ID;
  private readonly APP_KEY = process.env.ADZUNA_APP_KEY;
  private readonly BASE_URL = "https://api.adzuna.com/v1/api/jobs";

  async fetchJobs(params: FetchParams): Promise<NormalizedJob[]> {
    if (!this.APP_ID || !this.APP_KEY) {
      this.logger.error("Adzuna API credentials missing.");
      return [];
    }

    const { page, role, location } = params;
    const country = "in";
    const url = `${this.BASE_URL}/${country}/search/${page}`;

    const searchParams: any = {
      app_id: this.APP_ID,
      app_key: this.APP_KEY,
      results_per_page: 50,
      what: role || "software developer",
      "content-type": "application/json",
    };

    if (location && location.toLowerCase() !== "remote") {
      searchParams.where = location;
    }

    return this.fetchWithRetry(url, searchParams);
  }

  private async fetchWithRetry(
    url: string,
    params: any,
    retries = 3,
    backoff = 1000,
  ): Promise<NormalizedJob[]> {
    const startTime = Date.now();
    try {
      const response = await axios.get(url, { params, timeout: 5000 });
      const duration = Date.now() - startTime;

      this.logger.log(
        `Adzuna fetch success: ${response.data.results?.length || 0} jobs in ${duration}ms`,
      );

      const results = response.data.results || [];
      return results.map((job: any) => this.normalize(job));
    } catch (error) {
      if (
        retries > 0 &&
        (error.response?.status === 429 || error.response?.status >= 500)
      ) {
        this.logger.warn(
          `Adzuna API error ${error.response?.status}. Retrying in ${backoff}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, backoff));
        return this.fetchWithRetry(url, params, retries - 1, backoff * 2);
      }
      this.logger.error(`Adzuna fetch failed: ${error.message}`);
      return [];
    }
  }

  private normalize(job: any): NormalizedJob {
    return {
      externalId: String(job.id),
      title: job.title,
      company: job.company?.display_name || "Unknown",
      location: job.location?.display_name || "Remote",
      description: job.description || "",
      salary: job.salary_min
        ? `${job.salary_min} - ${job.salary_max}`
        : undefined,
      source: "ADZUNA",
      applyUrl: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title + " " + (job.company?.display_name || ""))}&location=${encodeURIComponent(job.location?.display_name || "Remote")}`,
      postedAt: new Date(job.created),
    };
  }
}
