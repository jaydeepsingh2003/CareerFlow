import { Module, Global, Logger } from "@nestjs/common";
import { getQueueToken } from "@nestjs/bullmq";

@Global()
@Module({
  providers: [
    {
      provide: getQueueToken("job-queue"),
      useValue: {
        add: async (name, data) => {
          Logger.log(
            `[LITE MODE] MockQueue: Skipping background task ${name}`,
            "QueueModule",
          );
          return { id: "mock-id" };
        },
        getRepeatableJobs: async () => [],
        removeRepeatableByKey: async () => {},
      },
    },
    {
      provide: getQueueToken("resume-queue"),
      useValue: {
        add: async (name, data) => {
          Logger.log(
            `[LITE MODE] MockQueue: Skipping background task ${name}`,
            "QueueModule",
          );
          return { id: "mock-id" };
        },
      },
    },
    {
      provide: getQueueToken("notification-queue"),
      useValue: {
        add: async (name, data) => {
          Logger.log(
            `[LITE MODE] MockQueue: Skipping background task ${name}`,
            "QueueModule",
          );
          return { id: "mock-id" };
        },
      },
    },
  ],
  exports: [
    getQueueToken("job-queue"),
    getQueueToken("resume-queue"),
    getQueueToken("notification-queue"),
  ],
})
export class QueueModule {}
