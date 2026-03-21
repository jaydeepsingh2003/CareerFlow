import { z } from "zod";

export const JDParsedSchema = z.object({
  skills: z.array(z.string()).describe("List of technical skills required"),
  softSkills: z.array(z.string()).describe("List of soft skills required"),
  experienceLevel: z.string().describe("Required seniority level"),
  roundHints: z
    .array(z.string())
    .describe("Potential interview round names/topics"),
  salaryEstimate: z
    .string()
    .optional()
    .describe("Extracted or estimated salary information"),
  keyResponsibilities: z
    .array(z.string())
    .describe("Top 5 key responsibilities"),
});

export type JDParsed = z.infer<typeof JDParsedSchema>;

export interface VectorMatch {
  id: string;
  score: number;
  metadata?: any;
}

export const ATSScoreSchema = z.object({
  score: z.number().min(0).max(100),
  skillOverlap: z.number().min(0).max(100),
  similarityScore: z.number().min(0).max(100),
  quantificationScore: z.number().min(0).max(100),
  missingSkills: z.array(z.string()),
  suggestions: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export type ATSScoreResult = z.infer<typeof ATSScoreSchema>;
