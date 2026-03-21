import { Injectable, Logger } from "@nestjs/common";
import * as cheerio from "cheerio";
import { RawJob } from "./adapters/job-source.adapter";

export interface NormalizedJob {
  externalId: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  source: string;
  applyUrl: string;
  postedAt: Date;
}

@Injectable()
export class JobNormalizationService {
  private readonly logger = new Logger(JobNormalizationService.name);

  normalize(raw: RawJob): NormalizedJob {
    return {
      externalId: raw.id,
      title: this.cleanText(raw.title),
      company: this.cleanText(raw.company),
      location: this.cleanText(raw.location),
      description: this.sanitizeHtml(raw.description),
      salary: raw.salary ? this.cleanText(raw.salary) : undefined,
      source: raw.source.toUpperCase(),
      applyUrl: raw.applyUrl,
      postedAt: raw.postedAt || new Date(),
    };
  }

  private cleanText(text: string): string {
    if (!text) return "";
    // Remove extra spaces, newlines, etc.
    return text.replace(/\s+/g, " ").trim();
  }

  private sanitizeHtml(html: string): string {
    if (!html) return "";
    // Use cheerio to get text verify clean html or text
    const $ = cheerio.load(html);
    return $.text().trim(); // For now, just extracting text for simplicity and safety
  }
}
