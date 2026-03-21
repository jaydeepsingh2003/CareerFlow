import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@Injectable()
export class RecurringJobService implements OnModuleInit {
  private readonly logger = new Logger(RecurringJobService.name);

  constructor(@InjectQueue("job-queue") private jobQueue: Queue) {}

  async onModuleInit() {
    try {
      this.logger.log("Initializing periodic job scheduler...");

      // Remove existing to avoid duplicates if ID changes
      const repeatableJobs = await this.jobQueue.getRepeatableJobs();
      for (const job of repeatableJobs) {
        await this.jobQueue.removeRepeatableByKey(job.key);
      }

      // Add repeatable job: Every 2 hours (120 minutes)
      await this.jobQueue.add(
        "periodic-ingestion",
        {},
        {
          repeat: {
            pattern: "0 */2 * * *", // Every 2 hours
          },
          removeOnComplete: true,
          removeOnFail: 1000,
        },
      );

      this.logger.log('Scheduled "periodic-ingestion" for every 2 hours.');
    } catch (error) {
      this.logger.error(
        `Failed to initialize scheduler: ${error.message}. Lite Mode: Periodic jobs will not run automatically.`,
      );
    }
  }
}
