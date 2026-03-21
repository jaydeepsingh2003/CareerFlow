import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";
import { JobIngestionService } from "./job-ingestion.service";

@Processor("job-queue")
export class JobProcessor extends WorkerHost {
  private readonly logger = new Logger(JobProcessor.name);

  constructor(private readonly ingestionService: JobIngestionService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`QueueWorker processing job: ${job.name} (ID: ${job.id})`);

    switch (job.name) {
      case "periodic-ingestion":
        return this.ingestionService.ingestAll();
      default:
        this.logger.warn(`Unknown job name in job-queue: ${job.name}`);
        return null;
    }
  }
}
