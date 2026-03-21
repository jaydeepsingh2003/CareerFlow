import { Injectable, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { PrismaService } from "../common/prisma/prisma.service";
import { AIService } from "../ai/ai.service";

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AIService,
    @InjectQueue("job-queue") private jobQueue: Queue,
  ) {}

  async create(data: any) {
    const job = await this.prisma.jobPosting.create({ data });
    // Trigger async analysis
    try {
      await this.jobQueue.add("analyze-job", { jobId: job.id });
    } catch (error) {
      this.logger.warn(
        `Failed to queue job analysis: ${error.message}. Analysis will be skipped.`,
      );
    }
    return job;
  }

  async findAll(
    filters: {
      role?: string;
      location?: string;
      skills?: string;
      salary?: string;
    } = {},
    page: number = 1,
    limit: number = 20,
  ) {
    const where: any = { status: "OPEN" };
    const andFilters: any[] = [];

    if (filters.role) {
      const roles = filters.role.split(",");
      andFilters.push({
        OR: roles.map((r) => ({
          title: { contains: r.trim() },
        })),
      });
    }

    if (filters.skills) {
      const skills = filters.skills.split(",");
      andFilters.push({
        OR: [
          ...skills.map((s) => ({
            requirements: { contains: s.trim() },
          })),
          ...skills.map((s) => ({
            description: { contains: s.trim() },
          })),
        ],
      });
    }

    if (filters.salary && filters.salary !== "50") {
      andFilters.push({
        OR: [{ salary: { contains: filters.salary } }, { salary: null }],
      });
    }

    if (filters.location) {
      where.location = { contains: filters.location };
    }

    if (andFilters.length > 0) {
      where.AND = andFilters;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [jobs, total] = await Promise.all([
      this.prisma.jobPosting.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.jobPosting.count({ where }),
    ]);

    return { jobs, total };
  }

  async findOne(id: string) {
    return this.prisma.jobPosting.findUnique({
      where: { id },
    });
  }

  async count() {
    return this.prisma.jobPosting.count();
  }

  async getFilterOptions() {
    const jobs = await this.prisma.jobPosting.findMany({
      where: { status: "OPEN" },
      select: { title: true },
    });

    const skills = await this.prisma.skill.findMany({
      select: { name: true },
    });

    // Extract unique job roles (limiting to top unique roles for cleaner UI)
    const uniqueRoles = Array.from(new Set(jobs.map((j) => j.title)))
      .filter(Boolean)
      .slice(0, 20);

    const skillNames = skills.map((s) => s.name);

    return {
      roles: uniqueRoles,
      skills: skillNames,
    };
  }

  async analyze(id: string) {
    await this.jobQueue.add("analyze-job", { jobId: id });
    return { message: "Job analysis task queued." };
  }
}
