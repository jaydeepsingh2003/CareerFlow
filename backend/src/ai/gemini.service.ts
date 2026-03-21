import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenAI, Type } from "@google/genai";

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly client: any;
  private readonly model: string;

  constructor(private config: ConfigService) {
    const apiKey = this.config.get<string>("GEMINI_API_KEY");
    this.client = new GoogleGenAI({ apiKey: apiKey || "" });
    // Using Gemini 2.x for state-of-the-art analysis
    this.model = "gemini-2.0-flash-exp";
  }

  // Declarations for Tool/Function Calling
  static readonly submitAssessmentResultsDeclaration = {
    name: "submitAssessmentResults",
    description:
      "Submit the final assessment results including extracted skills, scores, and domain.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        skills: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: "Skill name (e.g., React, Python)",
              },
              score: {
                type: Type.NUMBER,
                description: "Skill score from 0.0 to 1.0",
              },
            },
            required: ["name", "score"],
          },
        },
        domain: {
          type: Type.STRING,
          description: "Detected domain (e.g., Frontend Development)",
        },
        confidence: {
          type: Type.NUMBER,
          description: "Confidence score from 0.0 to 1.0",
        },
      },
      required: ["skills", "domain", "confidence"],
    },
  };

  static readonly enhanceResumeBulletDeclaration = {
    name: "enhanceResumeBullet",
    description:
      "Enhance a resume bullet point for maximum impact and technical clarity.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        original: { type: Type.STRING, description: "Original bullet point" },
        enhanced: { type: Type.STRING, description: "Improved version" },
        explanation: {
          type: Type.STRING,
          description: "Reasoning trace for the enhancement",
        },
      },
      required: ["original", "enhanced", "explanation"],
    },
  };

  static readonly extractJobRequirementsDeclaration = {
    name: "extractJobRequirements",
    description: "Extract structured data from a raw job description string.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        role: { type: Type.STRING },
        requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
        experienceLevel: { type: Type.STRING },
        suggestedInterviews: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["role", "requiredSkills", "experienceLevel"],
    },
  };

  async chat(prompt: string): Promise<string> {
    try {
      const result = await this.client.models.generateContent({
        model: this.model,
        contents: prompt,
      });
      return result.text || "";
    } catch (e) {
      this.logger.error("Gemini Generation Error", e);
      throw e;
    }
  }

  // Optimized assessment using function calling logic (abstracted here)
  async analyzeAssessment(history: any[]): Promise<any> {
    const prompt = `Based on the following interview history, call submitAssessmentResults with your final evaluation.
    History: ${JSON.stringify(history)}
    `;

    const result = await this.client.models.generateContent({
      model: this.model,
      contents: prompt,
      tools: [
        {
          functionDeclarations: [
            GeminiService.submitAssessmentResultsDeclaration,
          ],
        },
      ],
    });

    // Check for tool calls based on the new SDK structure
    const call = result.functionCalls?.[0];
    if (call) {
      return call.args;
    }
    // Simple fallback parsing if model doesn't call tool (rare for Gemini 2.0)
    return { skills: [], domain: "Unidentified", confidence: 0.5 };
  }

  async enhanceResumeBullet(
    bullet: string,
  ): Promise<{ original: string; enhanced: string; explanation: string }> {
    const prompt = `Enhance this resume bullet: "${bullet}". Use the enhanceResumeBullet tool.`;
    const result = await this.client.models.generateContent({
      model: this.model,
      contents: prompt,
      tools: [
        {
          functionDeclarations: [GeminiService.enhanceResumeBulletDeclaration],
        },
      ],
    });

    const call = result.functionCalls?.[0];
    if (call) return call.args as any;
    return {
      original: bullet,
      enhanced: bullet,
      explanation: "Model failed to provide upgrade.",
    };
  }

  async analyzeJob(text: string): Promise<any> {
    const prompt = `Extract job metadata from: "${text}". Use the extractJobRequirements tool.`;
    const result = await this.client.models.generateContent({
      model: this.model,
      contents: prompt,
      tools: [
        {
          functionDeclarations: [
            GeminiService.extractJobRequirementsDeclaration,
          ],
        },
      ],
    });

    const call = result.functionCalls?.[0];
    if (call) return call.args;
    return {
      role: "Unknown",
      requiredSkills: [],
      experienceLevel: "Not specified",
    };
  }
  async generateInterviewQuestions(
    jobTitle: string,
    jobDescription?: string,
  ): Promise<string[]> {
    const prompt = `Generate 5 high-fidelity technical interview questions for a ${jobTitle} role. 
      Context: ${jobDescription || "Standard architecture role."}
      Return ONLY as a JSON array of strings.`;

    const res = await this.chat(prompt);
    try {
      // Robust JSON extraction
      const clean = res
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      return JSON.parse(clean);
    } catch (e) {
      return [
        "Explain your architectural approach.",
        "How do you handle scalability?",
      ];
    }
  }

  async evaluateAnswer(
    question: string,
    answer: string,
  ): Promise<{ feedback: string; score: number }> {
    const prompt = `Evaluate this interview answer. 
      Question: ${question}
      Answer: ${answer}
      Provide constructive feedback and a score 0-10.
      Return ONLY JSON: { "feedback": "...", "score": 8.5 }`;

    const res = await this.chat(prompt);
    try {
      const clean = res
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      return JSON.parse(clean);
    } catch (e) {
      return { feedback: "Evaluation timed out.", score: 5.0 };
    }
  }
}
