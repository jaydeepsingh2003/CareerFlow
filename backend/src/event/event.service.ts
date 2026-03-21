import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../common/prisma/prisma.service";

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(private readonly prisma: PrismaService) {}

  async logEvent(type: string, metadata: any, userId?: string) {
    this.logger.log(`Event: ${type} - ${JSON.stringify(metadata)}`);

    try {
      return await this.prisma.eventLog.create({
        data: {
          type,
          metadata: JSON.stringify(metadata),
          userId,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log event: ${error.message}`);
    }
  }

  async getLogs(userId?: string) {
    return this.prisma.eventLog.findMany({
      where: userId ? { userId } : {},
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }
}
