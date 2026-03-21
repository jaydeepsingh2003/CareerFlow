import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";
import * as cheerio from "cheerio";
import { CreateJobDto } from "./dto/create-job.dto";

interface ExtractedJob {
  title: string;
  company: string;
  location: string;
  description: string;
  originalUrl: string;
  applyUrl?: string;
  externalId?: string;
  source: string;
  postedAt?: Date;
  requirements?: string[];
}

@Injectable()
export class JobParserService {
  private readonly logger = new Logger(JobParserService.name);

  async parse(url: string): Promise<ExtractedJob> {
    this.logger.log(`Parsing job from URL: ${url}`);

    try {
      const { data } = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      });

      const $ = cheerio.load(data);
      const domain = new URL(url).hostname;

      if (domain.includes("linkedin.com")) {
        return this.parseLinkedIn($, url);
      } else if (domain.includes("naukri.com")) {
        return this.parseNaukri($, url);
      } else {
        return this.parseGeneric($, url);
      }
    } catch (error) {
      this.logger.error(`Failed to parse URL: ${url}`, error);
      throw new Error(`Failed to parse job URL: ${error.message}`);
    }
  }

  private parseLinkedIn($: cheerio.CheerioAPI, url: string): ExtractedJob {
    // LinkedIn job pages structure varies, trying standard public job format
    // NOTE: LinkedIn heavily protects against scraping. This is a best-effort public parser request.
    // For production, use LinkedIn API or specialized scraping service.

    const title =
      $("h1.top-card-layout__title").text().trim() ||
      $("h1").first().text().trim();
    const company =
      $("a.top-card-layout__card-url").first().text().trim() ||
      $(".topcard__org-name-link").text().trim();
    const location =
      $("span.top-card-layout__first-subline").text().trim() ||
      $(".topcard__flavor--bullet").first().text().trim();

    // Description is often in a specific container
    const description =
      $(".description__text").html() ||
      $(".show-more-less-html__markup").html() ||
      "";

    // Try to find JSON-LD
    let jsonLd = {};
    $('script[type="application/ld+json"]').each((i, el) => {
      try {
        const json = JSON.parse($(el).html() || "{}");
        if (json["@type"] === "JobPosting") {
          jsonLd = json;
        }
      } catch (e) {}
    });

    if (jsonLd["title"]) {
      return {
        title: jsonLd["title"],
        company: jsonLd["hiringOrganization"]?.name || company,
        location: jsonLd["jobLocation"]?.address?.addressLocality || location,
        description: jsonLd["description"] || description,
        originalUrl: url,
        applyUrl: url, // Often same unless direct apply link found
        source: "LINKEDIN",
        postedAt: jsonLd["datePosted"]
          ? new Date(jsonLd["datePosted"])
          : new Date(),
        externalId: url.split("currentJobId=")[1]?.split("&")[0] || undefined,
      };
    }

    return {
      title: title || "Unknown Job Title",
      company: company || "Unknown Company",
      location: location || "Remote",
      description: description,
      originalUrl: url,
      applyUrl: url,
      source: "LINKEDIN",
      postedAt: new Date(),
    };
  }

  private parseNaukri($: cheerio.CheerioAPI, url: string): ExtractedJob {
    // Naukri logic
    const title = $(".jd-header-title").text().trim();
    const company = $(".jd-header-comp-name a").text().trim();
    const location = $(".jd-header-loc").text().trim();
    const description = $(".dang-inner-html").html() || "";

    return {
      title: title || "Unknown Job",
      company: company || "Unknown Company",
      location: location || "Unknown Location",
      description: description,
      originalUrl: url,
      applyUrl: url,
      source: "NAUKRI",
      postedAt: new Date(),
    };
  }

  private parseGeneric($: cheerio.CheerioAPI, url: string): ExtractedJob {
    // Generic fallback using meta tags
    const title =
      $('meta[property="og:title"]').attr("content") || $("title").text();
    const description =
      $('meta[property="og:description"]').attr("content") ||
      $("body").text().slice(0, 500);

    return {
      title: title || "Imported Job",
      company: "Imported",
      location: "Remote",
      description: description,
      originalUrl: url,
      applyUrl: url,
      source: "EXTERNAL",
      postedAt: new Date(),
    };
  }
}
