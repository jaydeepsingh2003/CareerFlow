import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import {
  JobSourceAdapter,
  RawJob,
  NormalizedJob,
  FetchParams,
} from "./job-source.adapter";

@Injectable()
export class RapidApiAdapter implements JobSourceAdapter {
  private readonly logger = new Logger(RapidApiAdapter.name);
  // Placeholder for JSearch or similar RapidAPI service
  private readonly BASE_URL = "https://jsearch.p.rapidapi.com/search";
  private readonly API_KEY = process.env.RAPID_API_KEY;
  private readonly API_HOST = "jsearch.p.rapidapi.com";

  async fetchJobs(params: FetchParams): Promise<NormalizedJob[]> {
    if (!this.API_KEY) {
      this.logger.warn("RapidAPI key missing. Using mock data.");
      return this.getMockData().map((j) => this.normalizeToNormalized(j));
    }

    try {
      const query = params.role || "Python Developer";
      const location = params.location || "Remote";

      const response = await axios.get(this.BASE_URL, {
        params: {
          query: `${query} in ${location}`,
          page: params.page || 1,
          num_pages: 1,
        },
        headers: {
          "X-RapidAPI-Key": this.API_KEY,
          "X-RapidAPI-Host": this.API_HOST,
        },
        timeout: 8000,
      });

      const results = response.data.data || [];
      return results.map((j: any) => this.normalize(j));
    } catch (error) {
      this.logger.error(`RapidAPI Fetch Failed: ${error.message}`);
      return this.getMockData().map((j) => this.normalizeToNormalized(j));
    }
  }

  private normalize(job: any): NormalizedJob {
    return {
      externalId: job.job_id,
      title: job.job_title,
      company: job.employer_name,
      location: `${job.job_city || ""}, ${job.job_country || ""}`,
      description: job.job_description || "",
      salary: job.job_min_salary
        ? `${job.job_min_salary}-${job.job_max_salary}`
        : undefined,
      applyUrl: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.job_title + " " + job.employer_name)}&location=${encodeURIComponent((job.job_city || "") + ", " + (job.job_country || ""))}`,
      postedAt: new Date(job.job_posted_at_datetime_utc),
      source: "RAPIDAPI",
    };
  }

  private normalizeToNormalized(job: RawJob): NormalizedJob {
    return {
      externalId: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      salary: job.salary,
      applyUrl: job.applyUrl,
      postedAt: job.postedAt,
      source: "RAPIDAPI",
    };
  }

  private getMockData(): RawJob[] {
    return [
      {
        id: "rapid-101",
        title: "Senior Full Stack Developer",
        company: "TechFlow Solutions",
        location: "Remote",
        description:
          "Build enterprise-scale applications using React, Node.js and TypeScript. Require experience with AWS and CI/CD.",
        applyUrl: "https://example.com/apply/101",
        postedAt: new Date(),
        source: "RAPIDAPI",
      },
      {
        id: "rapid-102",
        title: "AI/ML Engineer",
        company: "Neural Labs",
        location: "Bangalore, India",
        description:
          "Develop and deploy machine learning models using Python and PyTorch. Focus on LLM optimization.",
        applyUrl: "https://example.com/apply/102",
        postedAt: new Date(Date.now() - 86400000),
        source: "RAPIDAPI",
      },
      {
        id: "rapid-103",
        title: "DevOps Architect",
        company: "CloudScale Inc",
        location: "Remote",
        description:
          "Design and implement robust infrastructure using Kubernetes, Docker, and Terraform.",
        applyUrl: "https://example.com/apply/103",
        postedAt: new Date(Date.now() - 172800000),
        source: "RAPIDAPI",
      },
      {
        id: "rapid-104",
        title: "Backend Engineer - Node.js",
        company: "KodNest Systems",
        location: "Hyderabad, India",
        description:
          "Scale our high-traffic backend services. Strong knowledge of PostgreSQL and Redis required.",
        applyUrl: "https://example.com/apply/104",
        postedAt: new Date(),
        source: "RAPIDAPI",
      },
    ];
  }
}
