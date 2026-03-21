import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSystemStats() {
    // Using raw queries or simple count for SQLite compatibility and avoiding Prisma groupBy type issues in dev
    const [jobCounts, matchStats, totalEvents] = await Promise.all([
      // 1. Jobs by Source
      this.prisma.jobPosting.findMany({
        select: { source: true },
      }),
      // 2. Application Status Distribution
      this.prisma.jobTracking.findMany({
        select: { status: true },
      }),
      // 3. Total Events logged
      this.prisma.eventLog.count(),
    ]);

    // Post-process grouping for simplicity
    const jobsPerSource = this.countBy(jobCounts, "source");
    const applicationStatus = this.countBy(matchStats, "status");

    return {
      jobsPerSource,
      applicationStatus,
      totalEvents,
      conversionRate: this.calculateConversionRate(applicationStatus),
    };
  }

  private countBy(items: any[], key: string) {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      const val = item[key] || "UNKNOWN";
      counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }

  private calculateConversionRate(stats: any[]) {
    const total = stats.reduce((acc, curr) => acc + curr.count, 0);
    const applied = stats.find((s) => s.name === "APPLIED")?.count || 0;
    return total > 0 ? (applied / total) * 100 : 0;
  }

  async getMatchScoreDistribution() {
    const results = await this.prisma.jobTracking.findMany({
      select: { score: true },
    });

    const buckets = {
      "0-20": 0,
      "21-40": 0,
      "41-60": 0,
      "61-80": 0,
      "81-100": 0,
    };

    results.forEach((r) => {
      if (r.score === null || r.score === undefined) return;
      if (r.score <= 20) buckets["0-20"]++;
      else if (r.score <= 40) buckets["21-40"]++;
      else if (r.score <= 60) buckets["41-60"]++;
      else if (r.score <= 80) buckets["61-80"]++;
      else buckets["81-100"]++;
    });

    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }

  async getUserDashboard(userId: string) {
    const [profile, readinessScore] = await Promise.all([
      this.prisma.profile.findUnique({
        where: { userId },
        include: {
          skills: {
            include: { skill: true },
          },
        },
      }),
      this.prisma.readinessScore.findUnique({
        where: { userId },
      }),
    ]);

    const mappedSkills = (profile?.skills || []).map((us) => ({
      skillId: us.skill.normalizedName,
      name: us.skill.name,
      finalScore: us.level / 10,
      lastUpdated: us.createdAt,
      verified: us.verified,
      evidence: { reasoning: "Verified via Career Intelligence assessments." },
    }));

    const defaultPath = {
      title: "Neural Onboarding Trace",
      steps: [
        {
          skill: "AI Assessment",
          status: "in_progress",
          reason:
            "Initialize identity mapping to build your primary Skill Matrix.",
          videos: [],
        },
        {
          skill: "Micro-Simulation",
          status: "pending",
          reason:
            "Verify your deterministic architecture depth via code validation.",
          videos: [],
        },
      ],
    };

    return {
      skills: mappedSkills,
      overallScore: readinessScore?.currentScore || 0,
      learningPath: defaultPath,
      analysisDate: readinessScore?.updatedAt || new Date(),
    };
  }

  async getUserActivity(userId: string) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const logs = await this.prisma.eventLog.findMany({
      where: {
        userId,
        createdAt: { gte: sevenDaysAgo },
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    // Group logs by simplified date string (YYYY-MM-DD)
    const grouped = new Map<string, number>();
    
    // Initialize the last 7 days with 0 counts
    for (let i = 0; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      grouped.set(d.toISOString().split("T")[0], 0);
    }

    logs.forEach((log) => {
      const dateKey = log.createdAt.toISOString().split("T")[0];
      if (grouped.has(dateKey)) {
        grouped.set(dateKey, (grouped.get(dateKey) || 0) + 1);
      }
    });

    return Array.from(grouped.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}
