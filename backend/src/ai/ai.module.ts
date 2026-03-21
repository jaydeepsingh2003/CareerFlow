import { Module, Global } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AIService } from "./ai.service";
import { OllamaService } from "./ollama.service";
import { GroqService } from "./groq.service";
import { GeminiService } from "./gemini.service";
import { EmbeddingService } from "./embedding.service";
import { QdrantService } from "./qdrant.service";
import { ATSScoringService } from "./ats-scoring.service";
import { AICareerController } from "./ai-career.controller";

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [AICareerController],
  providers: [
    AIService,
    OllamaService,
    GroqService,
    GeminiService,
    EmbeddingService,
    QdrantService,
    ATSScoringService,
    {
      provide: "LLM_PROVIDER",
      useFactory: (
        config: ConfigService,
        ollama: OllamaService,
        groq: GroqService,
        gemini: GeminiService,
      ) => {
        const provider = config.get<string>("AI_PROVIDER", "ollama");
        if (provider === "gemini") return gemini;
        return provider === "groq" ? groq : ollama;
      },
      inject: [ConfigService, OllamaService, GroqService, GeminiService],
    },
  ],
  exports: [
    AIService,
    OllamaService,
    GroqService,
    GeminiService,
    EmbeddingService,
    QdrantService,
    ATSScoringService,
    "LLM_PROVIDER",
  ],
})
export class AIModule {}
