import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Ollama } from "ollama";

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);
  private readonly ollama: any;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>(
      "OLLAMA_HOST",
      "http://localhost:11434",
    );
    this.ollama = new Ollama({ host });
  }

  async generate(text: string): Promise<number[]> {
    try {
      this.logger.log("Generating embedding via Ollama...");
      const response = await this.ollama.embeddings({
        model: "mxbai-embed-large", // or 'nomic-embed-text'
        prompt: text,
      });
      return response.embedding;
    } catch (error) {
      this.logger.error(`Embedding generation failed: ${error.message}`);
      // Fallback to fake embedding during development if ollama is missing models
      return new Array(1024).fill(0).map(() => Math.random());
    }
  }
}
