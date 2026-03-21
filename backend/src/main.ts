import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { WinstonModule } from "nest-winston";
import * as winston from "winston";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context }) => {
              return `[${timestamp}] ${level}: ${context ? `[${context}] ` : ""}${message}`;
            }),
          ),
        }),
        new winston.transports.File({
          filename: "logs/combined.log",
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),
  });

  const logger = new Logger("Bootstrap");

  // Enable CORS
  app.enableCors();
  app.enableShutdownHooks();

  // Global Validation
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle("KodNestCareers Architect API")
    .setDescription("Production-grade Job Ingestion System")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Application started on port ${port}`);
}
bootstrap();
