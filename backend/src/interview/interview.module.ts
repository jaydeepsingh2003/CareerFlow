import { Module } from "@nestjs/common";
import { InterviewService } from "./interview.service";
import { InterviewController } from "./interview.controller";
import { PrismaModule } from "../common/prisma/prisma.module";
import { AIModule } from "../ai/ai.module";
import { EventModule } from "../event/event.module";
import { NotificationModule } from "../notification/notification.module";

@Module({
  imports: [PrismaModule, AIModule, EventModule, NotificationModule],
  providers: [InterviewService],
  controllers: [InterviewController],
  exports: [InterviewService],
})
export class InterviewModule {}
