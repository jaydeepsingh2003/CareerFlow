import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { JDParsed, JDParsedSchema } from "./ai.types";

@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name);
  private readonly apiKey: string;
  private readonly apiUrl = "https://api.groq.com/openai/v1/chat/completions";

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>("GROQ_API_KEY") || "";
  }

  async chat(prompt: string, retries = 3): Promise<JDParsed> {
    if (!this.apiKey) {
      throw new InternalServerErrorException("GROQ_API_KEY is not configured");
    }

    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        this.logger.log(`Attempt ${i + 1}: Calling Groq API (Llama 3)...`);

        const response = await axios.post(
          this.apiUrl,
          {
            model: "llama3-8b-8192",
            messages: [
              {
                role: "system",
                content:
                  "You are a professional HR and Technical Recruiter. You MUST respond ONLY with valid JSON matching the provided schema. Do not include markdown code blocks or explanations.",
              },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              "Content-Type": "application/json",
            },
          },
        );

        const content = response.data.choices[0].message.content;
        const parsed = JSON.parse(content);

        // Validate with Zod
        return JDParsedSchema.parse(parsed);
      } catch (error) {
        lastError = error;
        this.logger.warn(`Groq Attempt ${i + 1} failed: ${error.message}`);
        await new Promise((res) => setTimeout(res, 500 * (i + 1)));
      }
    }

    throw new InternalServerErrorException(
      `Groq Analysis failed after ${retries} attempts.`,
    );
  }
}
