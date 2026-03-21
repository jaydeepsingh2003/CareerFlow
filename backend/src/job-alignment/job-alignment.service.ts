import { Injectable, Logger } from "@nestjs/common";
import { QwenService } from "../resume-analysis/qwen.service";
import { JobAggregatorService } from "../jobs/job-aggregator.service";
import * as crypto from "crypto";
const pdfParse = require("pdf-parse");

export interface AlignmentResult {
  title: string;
  company: string;
  location: string;
  match_score: number;
  missing_skills: string[];
  weak_skills: string[];
  strong_skills: string[];
  reason: string;
  source: string;
  url: string;
}

@Injectable()
export class JobAlignmentService {
  private readonly logger = new Logger(JobAlignmentService.name);
  private readonly cache = new Map<string, AlignmentResult[]>();
  private readonly jobSkillCache = new Map<string, any[]>();

  constructor(
    private readonly qwenService: QwenService,
    private readonly aggregator: JobAggregatorService,
  ) {}

  async align(resumeBuffer: Buffer): Promise<AlignmentResult[]> {
    const hash = crypto.createHash("sha256").update(resumeBuffer).digest("hex");
    if (this.cache.has(hash)) {
      this.logger.log("Cache hit for resume alignment results");
      return this.cache.get(hash) as AlignmentResult[];
    }

    // 1. Parse Resume text
    let resumeText = "";
    try {
      const pdfData = await pdfParse(resumeBuffer);
      resumeText = pdfData.text;
    } catch (err) {
      resumeText = resumeBuffer.toString("utf-8");
    }

    // 2. Extract structured skills from resume using Qwen/Llama
    this.logger.log("Extracting resume profile via AI...");
    const profile = await this.qwenService.extractResumeSkills(resumeText);
    const userSkills = profile.skills || [];
    const userDomain = profile.domain || "software engineering";

    // 3. Fetch jobs from Adzuna + Muse (via Aggregator)
    this.logger.log(`Fetching jobs for domain: ${userDomain}`);
    const rawJobs = await this.aggregator.fetchAll(userDomain, "remote");

    // limit to 10 for balancing speed vs quality in real-time
    const jobsToAnalyze = rawJobs.slice(0, 10);

    // 4. Job Matching Pipeline
    const results: AlignmentResult[] = [];

    for (const job of jobsToAnalyze) {
      try {
        // Step 4.1: Extract skills for the job (Cached)
        const jobKey = crypto.createHash("md5").update(job.description).digest("hex");
        let requiredSkills = this.jobSkillCache.get(jobKey);

        if (!requiredSkills) {
          this.logger.log(`Extracting skills for job: ${job.title}`);
          const extraction = await this.qwenService.extractJdSkills(job.description);
          requiredSkills = extraction.required_skills || [];
          this.jobSkillCache.set(jobKey, requiredSkills as any[]);
        }

        // Step 4.2: Deterministic Matching Algorithm
        const matchResult = this.calculateMatch(userSkills, requiredSkills as any[]);

        // Step 4.3: Reasoning Generation
        const explanation = `Matched via Matrix: Your profile aligns with ${matchResult.strong_skills.slice(0, 2).map((s: any) => s.name).join(", ")}. Primary gaps detected in ${matchResult.missing_skills.slice(0, 1).map((s: any) => s.name).join("") || "N/A"}. Redirecting to LinkedIn for secure application.`;

        // Generate a LinkedIn Search URL for this specific job at this company for the user
        const linkedInUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title + " " + job.company)}&location=${encodeURIComponent(job.location)}`;

        results.push({
          title: job.title,
          company: job.company,
          location: job.location,
          match_score: matchResult.score,
          missing_skills: matchResult.missing_skills.map((s: any) => s.name),
          weak_skills: matchResult.weak_skills.map((s: any) => s.name),
          strong_skills: matchResult.strong_skills.map((s: any) => s.name),
          reason: explanation,
          source: job.source,
          url: linkedInUrl,
        });
      } catch (err) {
        this.logger.error(`Error aligning job ${job.title}: ${err.message}`);
      }
    }

    // 5. Ranking
    const rankedResults = results
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 10);

    this.cache.set(hash, rankedResults);
    return rankedResults;
  }

  private calculateMatch(userSkills: any[], requiredSkills: any[]) {
    const userMap = new Map();
    userSkills.forEach((s) =>
      userMap.set(s.name.toLowerCase().trim(), s.level),
    );

    let totalWeight = 0;
    let earnedWeight = 0;

    const missing: any[] = [];
    const weak: any[] = [];
    const strong: any[] = [];

    for (const req of requiredSkills) {
      const name = req.name.toLowerCase().trim();
      const importance = req.importance || 0.5;

      const userLevel = userMap.get(name) || 0;

      totalWeight += importance;
      earnedWeight += Math.min(userLevel, importance);

      const gap = importance - userLevel;

      if (gap > 0.5) missing.push(req);
      else if (gap >= 0.2) weak.push(req);
      else strong.push(req);
    }

    const score =
      totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;

    return {
      score,
      missing_skills: missing,
      weak_skills: weak,
      strong_skills: strong,
    };
  }
}
