import { Module } from "@nestjs/common";
import { MatchingService } from "./matching.service";
import { MatchingController } from "./matching.controller";
import { ApplicationService } from "./application.service";
import { ApplicationController } from "./application.controller";
import { AIModule } from "../ai/ai.module";
import { PrismaModule } from "../common/prisma/prisma.module";

import { GlobalCacheModule } from "../common/cache.module";

@Module({
  imports: [AIModule, PrismaModule, GlobalCacheModule],
  providers: [MatchingService, ApplicationService],
  controllers: [MatchingController, ApplicationController],
  exports: [MatchingService, ApplicationService],
})
export class MatchingModule {}
