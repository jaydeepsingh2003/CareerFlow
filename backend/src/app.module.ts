import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";

import { AuthModule } from "./auth/auth.module";
import { JobsModule } from "./jobs/jobs.module";
import { ProfileModule } from "./profile/profile.module";
import { MatchingModule } from "./matching/matching.module";

import { AIModule } from "./ai/ai.module";
import { ReadinessModule } from "./readiness/readiness.module";
import { ResumeModule } from "./resume/resume.module";
import { EventModule } from "./event/event.module";
import { QueueModule } from "./queue/queue.module";
import { PrismaModule } from "./common/prisma/prisma.module";
import { InterviewModule } from "./interview/interview.module";
import { NotificationModule } from "./notification/notification.module";
import { GlobalCacheModule } from "./common/cache.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { HealthModule } from "./health/health.module";
import { ScheduleModule } from "@nestjs/schedule";
import { TimeoutInterceptor } from "./common/interceptors/timeout.interceptor";
import { LoggerMiddleware } from "./common/middleware/logging.middleware";
import { ResumeAnalysisModule } from "./resume-analysis/resume-analysis.module";
import { JobAlignmentModule } from "./job-alignment/job-alignment.module";
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      // {
      //   ttl: 60000,
      //   limit: 100,
      // },
    ]),
    // GlobalCacheModule,
    PrismaModule,
    HealthModule,
    AuthModule,
    JobsModule,
    ProfileModule,
    MatchingModule,

    AIModule,
    ReadinessModule,
    ResumeModule,
    EventModule,
    QueueModule,
    InterviewModule,
    NotificationModule,
    AnalyticsModule,
    ScheduleModule.forRoot(),
    ResumeAnalysisModule,
    JobAlignmentModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*");
  }
}
