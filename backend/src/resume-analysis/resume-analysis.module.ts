import { Module } from "@nestjs/common";
import { ResumeAnalysisController } from "./resume-analysis.controller";
import { ResumeAnalysisService } from "./resume-analysis.service";
import { QwenService } from "./qwen.service";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  controllers: [ResumeAnalysisController],
  providers: [ResumeAnalysisService, QwenService],
  exports: [ResumeAnalysisService, QwenService],
})
export class ResumeAnalysisModule {}
