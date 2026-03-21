import { Module } from "@nestjs/common";
import { MatchingModule } from "../matching/matching.module";
import { AIModule } from "../ai/ai.module";
import { ReadinessService } from "./readiness.service";
import { ReadinessController } from "./readiness.controller";

import { PrismaModule } from "../common/prisma/prisma.module";

@Module({
  imports: [MatchingModule, AIModule, PrismaModule],
  providers: [ReadinessService],
  controllers: [ReadinessController],
})
export class ReadinessModule {}
