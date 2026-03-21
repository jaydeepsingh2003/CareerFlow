import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";

@Injectable()
export class ResumeService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: any) {
    const { personalInfo, experiences, education, skills, projects, template } =
      data;

    return this.prisma.resume.create({
      data: {
        userId,
        title: personalInfo.fullName || "Untitled Resume",
        template: template || "executive",
        data: JSON.stringify(data),
        status: "COMPLETED",
      },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: { assessment: true },
    });
  }

  async findOne(id: string) {
    const resume = await this.prisma.resume.findUnique({
      where: { id },
      include: { assessment: true },
    });
    if (!resume) throw new NotFoundException("Resume not found");
    return resume;
  }

  async generateAssessment(resumeId: string, jobId: string) {
    // Neural assessment simulation
    const score = Math.floor(Math.random() * 30) + 70; // 70-100 range

    return this.prisma.aTSAssessment.upsert({
      where: { resumeId },
      update: {
        overallScore: score,
        summary:
          "Neural analysis suggests high alignment with target role architecture.",
        suggestions:
          "Consider quantifying your impact in the most recent role.",
      },
      create: {
        resumeId,
        overallScore: score,
        summary: "Initial neural analysis complete.",
        suggestions:
          "Try adding more technical keywords from the job description.",
      },
    });
  }
}
