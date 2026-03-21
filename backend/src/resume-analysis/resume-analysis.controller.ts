import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ResumeAnalysisService } from "./resume-analysis.service";

@Controller("resume-analysis")
export class ResumeAnalysisController {
  constructor(private readonly resumeAnalysisService: ResumeAnalysisService) {}

  @Post("analyze")
  @UseInterceptors(FileInterceptor("resume"))
  async analyze(
    @UploadedFile() file: Express.Multer.File,
    @Body("jobDescription") jobDescription: string,
  ) {
    if (!file) {
      throw new BadRequestException("Resume file is required");
    }
    if (!jobDescription) {
      throw new BadRequestException("jobDescription text is required");
    }

    return await this.resumeAnalysisService.analyze(
      file.buffer,
      jobDescription,
    );
  }
}
