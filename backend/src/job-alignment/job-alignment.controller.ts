import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JobAlignmentService } from "./job-alignment.service";

@Controller("job-alignment")
export class JobAlignmentController {
  constructor(private readonly jobAlignmentService: JobAlignmentService) {}

  @Post("analyze")
  @UseInterceptors(FileInterceptor("resume"))
  async analyze(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException("Resume file is required");
    }

    return await this.jobAlignmentService.align(file.buffer);
  }
}
