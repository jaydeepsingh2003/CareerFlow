import { Module } from "@nestjs/common";
import { JobAlignmentController } from "./job-alignment.controller";
import { JobAlignmentService } from "./job-alignment.service";
import { ResumeAnalysisModule } from "../resume-analysis/resume-analysis.module";
import { JobsModule } from "../jobs/jobs.module";

@Module({
  imports: [ResumeAnalysisModule, JobsModule],
  controllers: [JobAlignmentController],
  providers: [JobAlignmentService],
})
export class JobAlignmentModule {}
