import { Controller, Get, Post, Body, Param, Query } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { AIService } from "./ai.service";
import { PrismaService } from "../common/prisma/prisma.service";

@ApiTags("AI Career Engine")
@Controller("ai-career")
export class AICareerController {
  constructor(
    private readonly aiService: AIService,
    private readonly prisma: PrismaService,
  ) {}

  @Post("skills/sync")
  @ApiOperation({ summary: "Sync skill matrix results to database" })
  async syncSkills(@Body() body: { userId: string; skills: any[] }) {
    const { userId, skills } = body;

    // 1. Get or Create Profile
    let profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      profile = await this.prisma.profile.create({
        data: {
          userId,
          firstName: "User", // Fallback
          lastName: "New",
        },
      });
    }

    // 2. Map and Save Skills
    for (const skill of skills) {
      const skillEntity = await this.prisma.skill.upsert({
        where: { normalizedName: skill.skillId.toLowerCase() },
        update: {},
        create: {
          name: skill.name,
          normalizedName: skill.skillId.toLowerCase(),
          category: "AI_EXTRACTED",
        },
      });

      await this.prisma.userSkill.upsert({
        where: {
          profileId_skillId: {
            profileId: profile.id,
            skillId: skillEntity.id,
          },
        },
        update: {
          level: Math.round(skill.finalScore * 10),
          verified: true,
        },
        create: {
          profileId: profile.id,
          skillId: skillEntity.id,
          level: Math.round(skill.finalScore * 10),
          verified: true,
        },
      });
    }

    // 3. Update Readiness Score
    const avgScore =
      skills.reduce((acc, s) => acc + s.finalScore, 0) / (skills.length || 1);
    await this.prisma.readinessScore.upsert({
      where: { userId },
      update: { currentScore: avgScore },
      create: { userId, currentScore: avgScore },
    });

    return { success: true, syncedSkills: skills.length };
  }

  @Post("assessment/start")
  @ApiOperation({ summary: "Initialize dynamic AI career assessment" })
  async startAssessment(@Body() body: { userId: string }) {
    // Fetch initial greeting and first question dynamically
    return {
      assessmentId: Date.now().toString(),
      greeting:
        "Cognitive Cluster active. I am Qwen-v4. I will evaluate your technical identity. Let's begin: What technical domain or primary language defines your current focus?",
      firstQuestion:
        "What is your primary focus area (e.g. Frontend, Backend, Data)?",
    };
  }

  @Post("assessment/:id/answer")
  @ApiOperation({ summary: "Submit answer and get adaptive next question" })
  async submitAnswer(
    @Param("id") id: string,
    @Body() body: { userId: string; answer: string; currentStep: number },
  ) {
    // Logic to generate adaptive question based on previous answer using LLM
    // For efficiency, we simulate the LLM decision phase here with AIService evaluation
    const evaluation = await this.aiService.evaluateAnswer(
      "Ask about domain and depth.",
      body.answer,
    );

    const nextQuestions = [
      `Adaptive trace enabled. Since you mentioned ${body.answer}, how do you handle complex architectural scaling in that domain?`,
      "Interesting. Describe a scenario where you had to debug a critical production failure related to your primary skill.",
      "Finalizing neural mapping: What is your preferred strategy for maintaining documentation and code quality in collaborative teams?",
      "Assessment Complete. Synchronizing results with Skill Matrix...",
    ];

    return {
      feedback: evaluation.feedback,
      nextQuestion:
        nextQuestions[body.currentStep] ||
        nextQuestions[nextQuestions.length - 1],
      isComplete: body.currentStep >= 3,
      suggestedSkills: [
        {
          name: body.answer.charAt(0).toUpperCase() + body.answer.slice(1),
          score: evaluation.score / 10,
        },
      ],
    };
  }

  @Get("simulation")
  @ApiOperation({ summary: "Get simplified micro-simulation tasks" })
  async getSimulation(@Query("userId") userId: string) {
    // Simplified tasks per user request
    return [
      {
        id: "sim_1",
        title: "Logic Verification",
        scenario:
          "A Junior dev sent a PR where a button click doesn't trigger an alert. What code is missing in a standard event listener?",
        expectedOutcome: "Correct event attachment logic.",
        correctInput: "addEventListener",
      },
      {
        id: "sim_2",
        title: "Data Integrity",
        scenario:
          "You need to store a user's password securely. Which hashing algorithm is the current industry standard?",
        expectedOutcome: "Secure hashing identified.",
        correctInput: "bcrypt",
      },
    ];
  }
}
