import { Injectable, Logger, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { AIService } from "../ai/ai.service";
import { PrismaService } from "../common/prisma/prisma.service";

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    private readonly aiService: AIService,
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getCandidateMatch(userId: string, jobId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: { include: { skills: { include: { skill: true } } } },
        resumes: true,
      },
    });
    const job = await this.prisma.jobPosting.findUnique({
      where: { id: jobId },
    });

    if (!user || !job) throw new Error("User or Job not found");

    // Logic duplication from getRankedFeed for single item (refactor candidate)
    const mainResume = user.resumes[0];
    let aiScore = 0;

    if (mainResume && mainResume.textContent) {
      const vectorMatch = (
        await this.aiService.findMatchingJobs(mainResume.textContent)
      ).find((v: any) => v.jobId === jobId);
      aiScore = vectorMatch ? vectorMatch.score * 100 : 0;
    }

    const skillOverlap = this.calculateSkillOverlap(user, job);
    const recencyScore = this.calculateRecencyScore(job.createdAt);
    const completenessScore = this.calculateCompleteness(user.profile);

    const finalScore =
      aiScore * 0.4 +
      skillOverlap * 0.3 +
      recencyScore * 0.2 +
      completenessScore * 0.1;

    // Explanation Logic
    const missing = this.getMissingSkills(user, job);

    return {
      overallMatch: Math.round(finalScore),
      breakdown: {
        ai: Math.round(aiScore),
        skills: Math.round(skillOverlap),
        recency: Math.round(recencyScore),
        completeness: Math.round(completenessScore),
      },
      explanation: {
        topMatchingSkills: [], // Could be computed
        missingSkills: missing,
        whyThisMatches: `Matches ${Math.round(skillOverlap)}% of skills.`,
        confidence: finalScore / 100,
      },
    };
  }

  async getRankedFeed(
    userId: string,
    limit = 20,
    offset = 0,
    filters: {
      role?: string;
      location?: string;
      source?: string;
      skills?: string;
      salary?: string;
    } = {},
  ) {
    this.logger.log(
      `Fetching ranked feed for user: ${userId} with filters: ${JSON.stringify(filters)}`,
    );

    const cacheKey = `feed:ranked:${userId}:${offset}:${JSON.stringify(filters)}`;
    // const cachedFeed = await this.cacheManager.get(cacheKey);
    // if (cachedFeed) return cachedFeed;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: { include: { skills: { include: { skill: true } } } },
        resumes: true,
      },
    });

    if (!user) throw new Error("User not found");

    // 1. Candidate Generation (Vector + Recency)
    let vectorCandidates: any[] = [];
    const mainResume = user.resumes[0];

    if (mainResume && mainResume.textContent) {
      vectorCandidates = await this.aiService.findMatchingJobs(
        mainResume.textContent,
      );
    }

    const vectorJobIds = vectorCandidates.map((v) => v.jobId);

    // Define Filters
    const conditions: any[] = [{ status: "OPEN" }];

    if (filters.role) {
      conditions.push({
        OR: [
          ...filters.role
            .split(",")
            .map((r) => ({ title: { contains: r.trim() } })),
          ...filters.role
            .split(",")
            .map((r) => ({ description: { contains: r.trim() } })),
        ],
      });
    }

    if (filters.skills) {
      conditions.push({
        OR: [
          ...filters.skills
            .split(",")
            .map((s) => ({ requirements: { contains: s.trim() } })),
          ...filters.skills
            .split(",")
            .map((s) => ({ description: { contains: s.trim() } })),
        ],
      });
    }

    if (filters.location) {
      conditions.push({ location: { contains: filters.location } });
    }

    if (filters.salary && filters.salary !== "50") {
      conditions.push({
        OR: [{ salary: { contains: filters.salary } }, { salary: null }],
      });
    }

    if (filters.source) {
      conditions.push({ source: filters.source.toUpperCase() });
    }

    conditions.push({
      OR: [
        { id: { in: vectorJobIds } },
        { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      ],
    });

    const whereClause = { AND: conditions };
    this.logger.log(
      `[MATCH] Final Where Clause: ${JSON.stringify(whereClause)}`,
    );

    // Get total matching jobs before limiting for proper pagination
    const totalMatchingJobs = await this.prisma.jobPosting.count({
      where: whereClause,
    });

    // Fetch jobs from DB up to 200 for ranking computation
    const jobPool = await this.prisma.jobPosting.findMany({
      where: whereClause,
      take: 200,
    });

    this.logger.log(
      `[MATCH] Pool size: ${jobPool.length}, Total matching: ${totalMatchingJobs}`,
    );

    // 2. Rank
    const rankedJobs = jobPool.map((job) => {
      const vectorMatch = vectorCandidates.find((v) => v.jobId === job.id);
      const aiScore = vectorMatch ? vectorMatch.score * 100 : 0;

      const skillOverlap = this.calculateSkillOverlap(user, job);
      const recencyScore = this.calculateRecencyScore(job.createdAt);
      const completenessScore = this.calculateCompleteness(user.profile);

      const finalScore =
        aiScore * 0.4 +
        skillOverlap * 0.3 +
        recencyScore * 0.2 +
        completenessScore * 0.1;

      return {
        ...job,
        matchScore: Math.round(finalScore),
        matchBreakdown: {
          ai: Math.round(aiScore),
          skills: Math.round(skillOverlap),
          recency: Math.round(recencyScore),
          completeness: Math.round(completenessScore),
        },
        explanation: {
          missingSkills: this.getMissingSkills(user, job),
          whyThisMatches: "Hybrid Match",
          confidence: Math.round(finalScore) / 100,
        },
      };
    });

    // 3. Sort & Paginate
    const sorted = rankedJobs.sort((a, b) => b.matchScore - a.matchScore);
    const paginated = sorted.slice(offset, offset + limit);

    await this.cacheManager.set(cacheKey, paginated, 60 * 60 * 1000); // 1 hour
    return {
      jobs: paginated,
      pagination: {
        total: totalMatchingJobs,
        limit: Number(limit),
        offset: Number(offset),
        page: Math.floor(offset / limit) + 1,
      },
    };
  }

  private calculateSkillOverlap(user: any, job: any): number {
    let jobRequirements: string[] = [];
    try {
      if (job.requirements) {
        const parsed =
          typeof job.requirements === "string"
            ? JSON.parse(job.requirements)
            : job.requirements;
        if (Array.isArray(parsed)) jobRequirements = parsed;
      }
    } catch (e) {}

    const userSkills =
      user.profile?.skills.map((s: any) => s.skill.name.toLowerCase()) || [];

    if (jobRequirements.length === 0) return 0; // No requirements = low score? Or medium? Let's say 0 for overlap.

    const matchCount = jobRequirements.filter((req) =>
      userSkills.some((skill: string) => skill.includes(req.toLowerCase())),
    ).length;

    return (matchCount / jobRequirements.length) * 100;
  }

  private getMissingSkills(user: any, job: any): string[] {
    let jobRequirements: string[] = [];
    try {
      const parsed = JSON.parse(job.requirements || "[]");
      if (Array.isArray(parsed)) jobRequirements = parsed;
    } catch (e) {}

    const userSkills = new Set(
      user.profile?.skills?.map((s: any) => s.skill.name.toLowerCase()) || [],
    );

    return jobRequirements.filter((req) => !userSkills.has(req.toLowerCase()));
  }

  private calculateRecencyScore(createdAt: Date): number {
    if (!createdAt) return 0;
    const daysOld = Math.floor(
      (new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysOld <= 1) return 100;
    if (daysOld <= 3) return 90;
    if (daysOld <= 7) return 75;
    if (daysOld <= 14) return 50;
    if (daysOld <= 30) return 30;
    return 10;
  }

  private calculateCompleteness(profile: any): number {
    if (!profile) return 0;
    const fields = ["firstName", "lastName", "headline", "bio", "location"];
    const filled = fields.filter((f) => !!profile[f]).length;
    const hasSkills = (profile.skills?.length || 0) > 0 ? 1 : 0;
    return ((filled + hasSkills) / (fields.length + 1)) * 100;
  }
}
