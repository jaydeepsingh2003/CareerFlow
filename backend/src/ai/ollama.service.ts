import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Ollama } from "ollama";
import { JDParsed, JDParsedSchema } from "./ai.types";

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);
  private readonly ollama: any;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>(
      "OLLAMA_HOST",
      "http://localhost:11434",
    );
    this.ollama = new Ollama({ host });
  }

  async chat(prompt: string, retries = 3): Promise<JDParsed> {
    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        this.logger.log(`Attempt ${i + 1}: Calling Ollama with Mistral...`);

        const response = await this.ollama.chat({
          model: "mistral",
          messages: [
            {
              role: "system",
              content:
                "You are a professional HR and Technical Recruiter. You MUST respond ONLY with valid JSON matching the provided schema. Do not include markdown code blocks or explanations.",
            },
            { role: "user", content: prompt },
          ],
          format: "json",
          options: { temperature: 0.2 },
        });

        const content = response.message.content;
        const parsed = JSON.parse(content);

        // Validate with Zod
        const validated = JDParsedSchema.parse(parsed);
        return validated;
      } catch (error) {
        lastError = error;
        this.logger.warn(`Attempt ${i + 1} failed: ${error.message}`);
        // Backoff
        await new Promise((res) => setTimeout(res, 1000 * (i + 1)));
      }
    }

    throw new InternalServerErrorException(
      `AI Analysis failed after ${retries} attempts. Last error: ${lastError?.message}`,
    );
  }
}
