import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { AIService } from "../ai/ai.service";
import { EventService } from "../event/event.service";
import { NotificationService } from "../notification/notification.service";

@Injectable()
export class InterviewService {
  private readonly logger = new Logger(InterviewService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AIService,
    private readonly eventService: EventService,
    private readonly notificationService: NotificationService,
  ) {}

  async startInterview(userId: string, jobId?: string, jobTitle?: string) {
    this.logger.log(
      `Starting mock interview for user ${userId} for job ${jobTitle}`,
    );

    // 1. Create Interview Record
    const interview = await this.prisma.mockInterview.create({
      data: {
        userId,
        jobId,
        jobTitle: jobTitle || "General Software Engineer",
        status: "STARTED",
      },
    });

    // 2. Generate Initial Questions (AI Simulated for MVP)
    const questions = await this.aiService.generateInterviewQuestions(
      jobTitle || "General Software Engineer",
    );

    // 3. Save Questions
    await this.prisma.interviewQuestion.createMany({
      data: questions.map((q, i) => ({
        interviewId: interview.id,
        questionText: q,
        order: i,
      })),
    });

    const interviewWithQuestions = await this.prisma.mockInterview.findUnique({
      where: { id: interview.id },
      include: { questions: true },
    });

    // Log Activity
    await this.eventService.logEvent(
      "INTERVIEW_START",
      {
        message: `Started mock interview for ${interview.jobTitle}`,
        interviewId: interview.id,
      },
      userId,
    );

    return interviewWithQuestions;
  }

  async submitAnswer(questionId: string, answer: string) {
    const question = await this.prisma.interviewQuestion.findUnique({
      where: { id: questionId },
    });
    if (!question) throw new Error("Question not found");

    const evaluation = await this.aiService.evaluateAnswer(
      question.questionText,
      answer,
    );

    return this.prisma.interviewQuestion.update({
      where: { id: questionId },
      data: {
        userAnswer: answer,
        aiFeedback: evaluation.feedback,
        score: evaluation.score,
      },
    });
  }

  async completeInterview(interviewId: string) {
    const interview = await this.prisma.mockInterview.findUnique({
      where: { id: interviewId },
      include: { questions: true },
    });

    if (!interview) throw new Error("Interview not found");

    const totalScore =
      interview.questions.reduce((acc, q) => acc + (q.score || 0), 0) /
      interview.questions.length;

    const completedInterview = await this.prisma.mockInterview.update({
      where: { id: interviewId },
      data: {
        status: "COMPLETED",
        score: totalScore * 10, // Scale to 100
        feedback:
          "Excellent performance overall. Focus on refining your system design explanations.",
      },
    });

    // 1. Log Activity
    await this.eventService.logEvent(
      "INTERVIEW_COMPLETE",
      {
        message: `Completed interview for ${completedInterview.jobTitle}. Final Score: ${completedInterview.score}%`,
        score: completedInterview.score,
        interviewId,
      },
      interview.userId,
    );

    // 2. Send Notification
    await this.notificationService.create(
      interview.userId,
      "Interview Evaluation Ready! 🎯",
      `You matched ${Math.round(completedInterview.score!)}% of the criteria for ${completedInterview.jobTitle}. Check your report.`,
    );

    return completedInterview;
  }

  async getHistory(userId: string) {
    return this.prisma.mockInterview.findMany({
      where: { userId },
      include: { questions: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async getInterview(id: string) {
    return this.prisma.mockInterview.findUnique({
      where: { id },
      include: { questions: true },
    });
  }
}
