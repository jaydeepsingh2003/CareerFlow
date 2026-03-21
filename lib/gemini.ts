import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

export const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const submitAssessmentResultsDeclaration = {
  name: "submitAssessmentResults",
  description: "Submit the final assessment results including extracted skills, scores, and domain.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      skills: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Skill name (e.g., React, Python)" },
            score: { type: Type.NUMBER, description: "Skill score from 0.0 to 1.0" }
          },
          required: ["name", "score"]
        }
      },
      domain: { type: Type.STRING, description: "Detected domain (e.g., Frontend Development)" },
      confidence: { type: Type.NUMBER, description: "Confidence score from 0.0 to 1.0" }
    },
    required: ["skills", "domain", "confidence"]
  }
};
