import { Injectable, Logger, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { EmbeddingService } from "./embedding.service";
import { QdrantService } from "./qdrant.service";
import { ATSScoringService } from "./ats-scoring.service";
import { JDParsed, ATSScoreResult } from "./ai.types";
import * as crypto from "crypto";

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    @Inject("LLM_PROVIDER") private readonly llmProvider: any,
    @Inject(CACHE_MANAGER) public cacheManager: Cache,
    public readonly embeddingService: EmbeddingService,
    public readonly qdrantService: QdrantService,
    public readonly atsScoringService: ATSScoringService,
  ) {}

  async storeJobEmbedding(jobId: string, text: string) {
    this.logger.log(`Storing embedding for Job: ${jobId}`);
    const vector = await this.embeddingService.generate(text);
    await this.qdrantService.upsertJob(jobId, vector, {
      jobId,
      description: text.slice(0, 1000),
    });
  }

  private generateHash(text: string): string {
    return crypto.createHash("md5").update(text).digest("hex");
  }

  async analyzeJobDescription(jobId: string, text: string): Promise<JDParsed> {
    const textHash = this.generateHash(text);
    const cacheKey = `ai:jd_analysis:${textHash}`;

    const cachedResult = await this.cacheManager.get<JDParsed>(cacheKey);
    if (cachedResult) {
      this.logger.log(`[CACHE HIT] Using cached analysis for Job: ${jobId}`);
      return cachedResult;
    }

    this.logger.log(`Starting JD Analysis Pipeline for Job: ${jobId}`);
    const vector = await this.embeddingService.generate(text);
    const matches = await this.qdrantService.searchSimilar(vector, 2);
    const context = matches
      .map((m) => (m.payload as any)?.description)
      .join("\n---\n");

    this.qdrantService.upsertJob(jobId, vector, {
      jobId,
      description: text.slice(0, 1000),
    });

    const prompt = `
            Analyze the following Job Description and extract key information.
            
            Context from similar jobs:
            ${context}

            Job Description Text:
            ${text}

            Schema Requirements:
            - Extract precise technical skills.
            - Identify soft skills.
            - Determine experience level.
            - Suggest interview rounds.
            - Summarize top 5 responsibilities.
        `;

    const result = await this.llmProvider.chat(prompt);
    await this.cacheManager.set(cacheKey, result, 60 * 60 * 24 * 1000);
    return result;
  }

  async findMatchingJobs(resumeText: string) {
    const textHash = this.generateHash(resumeText);
    const cacheKey = `ai:match_search:${textHash}`;

    const cachedResult = await this.cacheManager.get<any[]>(cacheKey);
    if (cachedResult) {
      this.logger.log(`[CACHE HIT] Using cached job matches for resume.`);
      return cachedResult;
    }

    const vector = await this.embeddingService.generate(resumeText);
    const matches = await this.qdrantService.searchSimilar(vector, 10);

    const results = matches.map((m) => ({
      jobId: (m.payload as any)?.jobId || m.id,
      score: m.score,
    }));

    await this.cacheManager.set(cacheKey, results, 60 * 60 * 24 * 1000);
    return results;
  }

  async scoreResume(
    resumeText: string,
    jobDescription: string,
  ): Promise<ATSScoreResult> {
    const combinedText = `${resumeText}|${jobDescription}`;
    const textHash = this.generateHash(combinedText);
    const cacheKey = `ai:ats_hybrid_score:${textHash}`;

    const cachedResult = await this.cacheManager.get<ATSScoreResult>(cacheKey);
    if (cachedResult) {
      this.logger.log(`[CACHE HIT] Using cached hybrid ATS score.`);
      return cachedResult;
    }

    const result = await this.atsScoringService.scoreHybrid(
      resumeText,
      jobDescription,
    );

    await this.cacheManager.set(cacheKey, result, 60 * 60 * 24 * 1000);
    return result;
  }

  async generateLearningPlan(missingSkills: string[], jobTitle: string) {
    if (!missingSkills.length) return [];

    // Fallback procedural generation for demo
    return missingSkills.map((skill) => ({
      title: `Master ${skill}`,
      description: `Acquire core competency in ${skill} to meet job requirements. Focus on practical application.`,
      resources: [
        "Official Documentation",
        "Interactive Tutorial",
        "Build a small demo project",
      ],
    }));
  }

  async generateInterviewQuestions(
    jobTitle: string,
    jobDescription?: string,
  ): Promise<string[]> {
    const fallback = [
      `Can you describe your experience with ${jobTitle}?`,
      `What is a challenging technical problem you've solved recently?`,
      `How do you handle deadlines and pressure?`,
      `Explain a key concept in your field to a non-technical person.`,
      `Where do you see yourself in 5 years?`,
    ];

    try {
      const prompt = `
                Generate 5 relevant interview questions for a ${jobTitle} role.
                Job Description Context: ${jobDescription || "Standard industry requirements"}
                
                Return ONLY a JSON array of strings. Do not include markdown code blocks.
                Example: ["Question 1", "Question 2"]
            `;

      this.logger.log(
        `Generating interview questions for ${jobTitle} via LLM...`,
      );
      const result = await this.llmProvider.chat(prompt);

      // Clean up potential markdown or extra text
      const jsonStr = result
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const questions = JSON.parse(jsonStr);

      if (Array.isArray(questions) && questions.length > 0) {
        return questions.slice(0, 5);
      }
      return fallback;
    } catch (e) {
      this.logger.warn(
        "Failed to generate AI interview questions, using fallback.",
        e,
      );
      return fallback;
    }
  }

  async evaluateAnswer(
    question: string,
    answer: string,
  ): Promise<{ feedback: string; score: number }> {
    try {
      const prompt = `
                Act as a technical interviewer. Evaluate the following answer to the interview question.
                
                Question: "${question}"
                Answer: "${answer}"
                
                Provide a JSON response with:
                - feedback: A constructive feedback string (max 2 sentences).
                - score: A number from 1-10 (1 decimal place allowed).
                
                Return ONLY the JSON.
            `;

      const result = await this.llmProvider.chat(prompt);
      const jsonStr = result
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const evaluation = JSON.parse(jsonStr);

      return {
        feedback: evaluation.feedback || "Good attempt.",
        score: typeof evaluation.score === "number" ? evaluation.score : 7.0,
      };
    } catch (e) {
      this.logger.warn("AI evaluation failed, using heuristic fallback.", e);

      // Fallback Heuristic
      const keyTerms = [
        "experience",
        "learned",
        "team",
        "solved",
        "impact",
        "used",
        "built",
        "improved",
      ];
      const matches = keyTerms.filter((term) =>
        answer.toLowerCase().includes(term),
      );

      let score = 5;
      score += Math.min(answer.length / 50, 3);
      score += matches.length * 0.5;
      score = Math.min(Math.round(score * 10) / 10, 10);

      let feedback = "Good effort.";
      if (score > 8)
        feedback = "Excellent answer with strong specific details and impact.";
      else if (score > 6)
        feedback = "Solid answer, but try to use the STAR method.";
      else feedback = "A bit brief. elaborate on your specific contribution.";

      return { feedback, score };
    }
  }
}
