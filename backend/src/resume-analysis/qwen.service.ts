import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class QwenService {
  private readonly logger = new Logger(QwenService.name);
  private readonly apiKey: string;
  private readonly model: string;
  private readonly apiUrl = "https://api.groq.com/openai/v1/chat/completions";

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>("LLAMA_API_KEY", "");
    this.model = this.configService.get<string>(
      "AI_MODEL",
      "llama-3.3-70b-versatile",
    );

    if (!this.apiKey) {
      this.logger.warn(
        "LLAMA_API_KEY is not set — resume analysis will fail at runtime",
      );
    }
  }

  async extractResumeSkills(resumeText: string): Promise<any> {
    return this.callLlama(`
You are an expert technical recruiter. Analyze the following resume text and extract all skills and the candidate's domain.
Return ONLY valid JSON matching this structure:
{
  "skills": [ { "name": "string", "level": number (0 to 1), "years": number } ],
  "domain": "string"
}

Resume Text:
${resumeText.substring(0, 6000)}
    `);
  }

  async extractJdSkills(jdText: string): Promise<any> {
    return this.callLlama(`
You are an expert technical recruiter. Analyze the following job description and extract all required skills and the role.
Return ONLY valid JSON matching this structure:
{
  "required_skills": [ { "name": "string", "importance": number (0 to 1) } ],
  "role": "string"
}

Job Description Text:
${jdText.substring(0, 6000)}
    `);
  }

  private async callLlama(prompt: string, retries = 3): Promise<any> {
    if (!this.apiKey) {
      throw new InternalServerErrorException(
        "LLAMA_API_KEY is not configured in .env",
      );
    }

    let lastError: Error | null = null;

    for (let i = 0; i < retries; i++) {
      try {
        this.logger.log(
          `Attempt ${i + 1}: Calling Groq API (${this.model})...`,
        );

        const response = await axios.post(
          this.apiUrl,
          {
            model: this.model,
            messages: [
              {
                role: "system",
                content:
                  "You are a professional HR and Technical Recruiter. You MUST respond ONLY with valid JSON matching the provided schema. Do not include markdown code blocks, backticks, or explanations outside the JSON object.",
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
            timeout: 30000,
          },
        );

        const content = response.data.choices[0].message.content;
        let cleanContent = content.trim();

        // Strip markdown code fences if model wraps them
        if (cleanContent.startsWith("```json")) {
          cleanContent = cleanContent.substring(7);
        }
        if (cleanContent.startsWith("```")) {
          cleanContent = cleanContent.substring(3);
        }
        if (cleanContent.endsWith("```")) {
          cleanContent = cleanContent.substring(0, cleanContent.length - 3);
        }

        const parsed = JSON.parse(cleanContent.trim());
        this.logger.log(
          `Successfully parsed Llama response on attempt ${i + 1}`,
        );
        return parsed;
      } catch (error) {
        lastError = error;
        const statusCode = error?.response?.status;
        const errorMsg = error?.response?.data?.error?.message || error.message;
        this.logger.warn(
          `Llama Attempt ${i + 1} failed (status: ${statusCode || "N/A"}): ${errorMsg}`,
        );
        await new Promise((res) => setTimeout(res, 1000 * (i + 1)));
      }
    }

    throw new InternalServerErrorException(
      `Llama Analysis failed after ${retries} attempts. Last error: ${lastError?.message}`,
    );
  }
}
