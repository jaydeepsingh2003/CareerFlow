import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";
import { EventService } from "../event/event.service";
import { NotificationService } from "../notification/notification.service";

@Injectable()
export class ApplicationService {
  private readonly logger = new Logger(ApplicationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventService: EventService,
    private readonly notificationService: NotificationService,
  ) {}

  async getApplications(userId: string) {
    return this.prisma.jobTracking.findMany({
      where: {
        userId,
        status: {
          not: "SAVED",
        },
      },
      include: {
        job: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async updateStatus(
    userId: string,
    jobId: string,
    status: string,
    appliedVia?: string,
  ) {
    this.logger.log(
      `Updating tracking status for user ${userId}, job ${jobId} to ${status}`,
    );

    const tracking = await this.prisma.jobTracking.upsert({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
      update: {
        status,
        appliedVia,
        appliedAt: status === "APPLIED" ? new Date() : undefined,
      },
      create: {
        userId,
        jobId,
        status,
        appliedVia,
        appliedAt: status === "APPLIED" ? new Date() : undefined,
        score: 0,
      },
      include: {
        job: true,
      },
    });

    // 1. Log Activity
    await this.eventService.logEvent(
      "APPLY",
      {
        message: `Applied to ${tracking.job.company} for ${tracking.job.title} via ${appliedVia || "KodNest"}`,
        jobId: tracking.jobId,
        status: tracking.status,
        appliedVia,
      },
      userId,
    );

    // 2. Send Notification
    if (status === "APPLIED") {
      await this.notificationService.create(
        userId,
        "Application Sent! 🚀",
        `Your application for ${tracking.job.title} at ${tracking.job.company} has been received.`,
      );
    }

    return tracking;
  }

  async getStats(userId: string) {
    const tracking = await this.prisma.jobTracking.findMany({
      where: { userId },
    });

    return {
      total: tracking.length,
      applied: tracking.filter((m) => m.status === "APPLIED").length,
      interviewing: tracking.filter((m) => m.status === "INTERVIEWING").length,
      offers: tracking.filter((m) => m.status === "OFFER").length,
      rejected: tracking.filter((m) => m.status === "REJECTED").length,
    };
  }
}
