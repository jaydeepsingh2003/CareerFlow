import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";

import { AIService } from "../ai/ai.service";

@Injectable()
export class ReadinessService {
  private readonly logger = new Logger(ReadinessService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AIService,
  ) {}

  async generatePlan(userId: string, jobId: string) {
    this.logger.log(
      `Generating readiness plan for user ${userId} and job ${jobId}`,
    );

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: { include: { skills: { include: { skill: true } } } },
      },
    });

    const job = await this.prisma.jobPosting.findUnique({
      where: { id: jobId },
    });

    if (!user || !job) throw new Error("User or Job not found");

    // Logic: Compare skills and generate prep tasks
    const userSkills =
      user.profile?.skills.map((s) => s.skill.name.toLowerCase()) || [];
    const jobRequirements: string[] =
      typeof job.requirements === "string"
        ? JSON.parse(job.requirements)
        : Array.isArray(job.requirements)
          ? job.requirements
          : [];

    const missingSkills = jobRequirements.filter(
      (req) => !userSkills.some((skill) => skill.includes(req.toLowerCase())),
    );

    // Generate AI-driven plan
    const generatedTasks = await this.aiService.generateLearningPlan(
      missingSkills,
      job.title,
    );

    // Calculate score
    const currentScore =
      jobRequirements.length > 0
        ? ((jobRequirements.length - missingSkills.length) /
            jobRequirements.length) *
          100
        : 100;

    // Fetch existing score to append history
    const existingScore = await this.prisma.readinessScore.findUnique({
      where: { userId },
    });
    let history: any[] = [];
    try {
      if (existingScore?.history) {
        history = JSON.parse(existingScore.history);
      }
    } catch (e) {}

    history.push({ date: new Date(), score: currentScore });
    if (history.length > 20) history = history.slice(-20); // Keep last 20

    // Create Score record
    await this.prisma.readinessScore.upsert({
      where: { userId },
      update: {
        currentScore,
        history: JSON.stringify(history),
      },
      create: {
        userId,
        currentScore,
        history: JSON.stringify([{ date: new Date(), score: currentScore }]),
      },
    });

    // Create or Update Prep Plan
    // Since we have a unique constraint on [userId, jobId], we should upsert or delete/create.
    // For simplicity, let's delete existing and create new to refresh the plan.
    await this.prisma.prepPlan.deleteMany({
      where: {
        userId,
        jobId,
      },
    });

    const plan = await this.prisma.prepPlan.create({
      data: {
        jobId,
        userId,
        tasks: {
          create: generatedTasks.map((task, index) => ({
            title: task.title,
            description: task.description,
            order: index,
            resources: JSON.stringify(task.resources),
          })),
        },
      },
      include: { tasks: true },
    });

    return {
      score: currentScore,
      missingSkills,
      prepPlan: plan,
    };
  }

  async getScore(userId: string) {
    return this.prisma.readinessScore.findUnique({
      where: { userId },
    });
  }

  async getLatestPlan(userId: string) {
    return this.prisma.prepPlan.findFirst({
      where: { userId },
      orderBy: { generatedAt: "desc" },
      include: { tasks: true },
    });
  }
}
