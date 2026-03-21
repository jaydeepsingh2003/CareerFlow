import { Injectable, Logger, Inject } from "@nestjs/common";
import { EmbeddingService } from "./embedding.service";
import { ATSScoreResult, ATSScoreSchema } from "./ai.types";
import { performance } from "perf_hooks";

@Injectable()
export class ATSScoringService {
  private readonly logger = new Logger(ATSScoringService.name);

  constructor(
    @Inject("LLM_PROVIDER") private readonly llmProvider: any,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async scoreHybrid(
    resumeText: string,
    jobDescription: string,
  ): Promise<ATSScoreResult> {
    const startTime = performance.now();
    this.logger.log("Starting Hybrid ATS Scoring...");

    try {
      // 1. Semantic Similarity (Vector-based)
      const similarityScore = await this.calculateSimilarity(
        resumeText,
        jobDescription,
      );

      // 2. Rule-based Skill Overlap & Extraction
      const { overlap, extractedKeywords } = this.calculateKeywordCoverage(
        resumeText,
        jobDescription,
      );

      // 3. Quantification Detection (Data-driven evidence)
      const quantScore = this.calculateQuantification(resumeText);

      // 4. AI-Enhanced Analysis (Suggestions & Missing Skills)
      let aiAnalysis: Partial<ATSScoreResult> = {};
      try {
        aiAnalysis = await this.getAIInsights(
          resumeText,
          jobDescription,
          extractedKeywords,
        );
      } catch (error) {
        this.logger.warn(
          `AI Insight generation failed, falling back to rules: ${error.message}`,
        );
        aiAnalysis = this.generateFallbackInsights(extractedKeywords);
      }

      // 5. Weight-based Final Score Calculation
      // Weights: Similarity (40%), Skill Overlap (40%), Quantification (20%)
      const rawScore = similarityScore * 0.4 + overlap * 0.4 + quantScore * 0.2;
      const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

      const result: ATSScoreResult = {
        score: finalScore,
        skillOverlap: Math.round(overlap),
        similarityScore: Math.round(similarityScore),
        quantificationScore: Math.round(quantScore),
        missingSkills: aiAnalysis.missingSkills || [],
        suggestions: aiAnalysis.suggestions || [],
        confidence: 0.85, // Meta-confidence in the scoring pipeline
      };

      // Guardrails: Validate Schema
      const validated = ATSScoreSchema.parse(result);

      const duration = (performance.now() - startTime).toFixed(2);
      this.logger.log(
        `Hybrid Scoring Completed in ${duration}ms. Final Score: ${finalScore}`,
      );

      return validated;
    } catch (error) {
      this.logger.error(`Critical failure in ATS Scoring: ${error.message}`);
      throw error;
    }
  }

  private async calculateSimilarity(
    resume: string,
    jd: string,
  ): Promise<number> {
    const [resumeVec, jdVec] = await Promise.all([
      this.embeddingService.generate(resume.slice(0, 4000)),
      this.embeddingService.generate(jd.slice(0, 4000)),
    ]);

    // Cosine Similarity
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < resumeVec.length; i++) {
      dotProduct += resumeVec[i] * jdVec[i];
      normA += resumeVec[i] * resumeVec[i];
      normB += jdVec[i] * jdVec[i];
    }
    const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    return similarity * 100; // Scale to 0-100
  }

  private calculateKeywordCoverage(resume: string, jd: string) {
    // Simplified keyword extractor (ideally use a list of known tech skills)
    const commonSkills = [
      "react",
      "node",
      "typescript",
      "javascript",
      "python",
      "java",
      "aws",
      "docker",
      "kubernetes",
      "postgresql",
      "mongodb",
      "sql",
      "next.js",
      "nest.js",
      "tailwind",
    ];

    const jdLow = jd.toLowerCase();
    const resLow = resume.toLowerCase();

    const jdSkills = commonSkills.filter((skill) => jdLow.includes(skill));
    if (jdSkills.length === 0) return { overlap: 80, extractedKeywords: [] }; // Neutral if no skills found

    const matchedSkills = jdSkills.filter((skill) => resLow.includes(skill));
    const overlap = (matchedSkills.length / jdSkills.length) * 100;

    return {
      overlap,
      extractedKeywords: jdSkills,
    };
  }

  private calculateQuantification(resume: string): number {
    // Look for percentages, currency, and high numbers representing impact
    const patterns = [
      /\d+%/g, // Percentages
      /\$\d+/g, // Currency
      /\d+\+/g, // Numbers like 5+, 100+
      /revenue|growth|optimization|reduced|improved|increased/gi, // Impact verbs
    ];

    let hits = 0;
    patterns.forEach((p) => {
      const matches = resume.match(p);
      if (matches) hits += Math.min(matches.length, 5); // Cap per pattern to avoid bias
    });

    // Score: 0 hits = 40 (baseline), 20+ hits = 100
    return Math.min(100, 40 + hits * 3);
  }

  private async getAIInsights(
    resume: string,
    jd: string,
    jdSkills: string[],
  ): Promise<Partial<ATSScoreResult>> {
    const prompt = `
            Act as an expert ATS auditor. Analyze this resume against the JD.
            
            Current extracted skills from JD: ${jdSkills.join(", ")}
            
            Input JSON schema expectations:
            {
                "missingSkills": ["skill1", "skill2"],
                "suggestions": ["improvement point 1", "improvement point 2"]
            }

            JD: ${jd.slice(0, 2000)}
            Resume: ${resume.slice(0, 2000)}
        `;

    const response = await this.llmProvider.chat(prompt);
    return {
      missingSkills: response.missingSkills || [],
      suggestions: response.suggestions || [],
    };
  }

  private generateFallbackInsights(
    extractedKeywords: string[],
  ): Partial<ATSScoreResult> {
    return {
      missingSkills: extractedKeywords
        .slice(0, 3)
        .map((k) => `${k} (Verify experience)`),
      suggestions: [
        "Quantify your impact with more percentages or figures.",
        "Ensure your section headers are clearly labeled (Professional Experience, Skills, Education).",
        "Mirror the specific terminology found in the Job Description.",
      ],
    };
  }
}
