import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const MAX_HISTORY = 12;
const MAX_QUESTIONS = 5;

// Model cascade: try lite first (lower quota usage), fallback to 2.5-flash
const MODELS = [
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash",
  "gemini-2.0-flash",
];

const SYSTEM_PROMPT = `You are a friendly, professional Senior Engineering Manager conducting a technical mock interview.
You are interacting purely via voice. Speak conversationally, naturally, and warmly, just like a real human interviewer would.

If this is the VERY FIRST turn of the interview, introduce yourself briefly (e.g., "Hi there! I'm your AI interviewer today. It's great to meet you."), mention we will go through exactly ${MAX_QUESTIONS} questions on the requested topic and difficulty, and then seamlessly ask the first question.
For this first response, write your entire response simply as plain text without any Score or Feedback prefixes. Always end your first response by explicitly saying:
"Next Question: (your first question here)"

For ALL SUBSEQUENT turns (when the user provides an answer), you MUST use this EXACT format:

Score: X/10
Feedback: (2-3 short, conversational sentences giving them feedback)
Next Question: (your next question naturally phrased)

Once exactly ${MAX_QUESTIONS} questions have been answered, end the interview using ONLY this format:

Final Score: X/50
Summary: (3-4 conversational sentences summarizing their performance)
Strong Areas: (comma-separated list)
Improve On: (comma-separated list)

Rules:
- You MUST adjust the technical depth and complexity of your questions to accurately match the requested difficulty. Do not ask advanced questions on an 'Easy' level, and do not ask basic definitions on a 'Hard' level.
- Keep your tone conversational, encouraging, and professional.
- Do NOT use markdown formatting like ** or ## since this text is processed by a text-to-speech engine.`;

export async function POST(request) {
  try {
    const body = await request.json();
    const { topic, difficulty, conversationHistory = [] } = body;

    if (conversationHistory.length > MAX_HISTORY) {
      return NextResponse.json(
        { error: "Session limit reached. Please start a new interview." },
        { status: 429 }
      );
    }

    if (!topic || !difficulty) {
      return NextResponse.json(
        { error: "Topic and difficulty are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service is not configured." },
        { status: 500 }
      );
    }

    // Build history and user message once
    let priorHistory = conversationHistory;
    let userMessage;

    const initialUserTurn = {
      role: "user",
      parts: [{ text: `Topic: ${topic}\nDifficulty: ${difficulty}\n\nPlease start the interview by asking the first question.` }]
    };

    if (conversationHistory.length === 0) {
      priorHistory = [];
      userMessage = initialUserTurn.parts[0].text;
    } else {
      priorHistory = conversationHistory.slice(0, -1);
      userMessage = conversationHistory[conversationHistory.length - 1].content;
    }

    let history = priorHistory.map((msg) => ({
      role: msg.role === "ai" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    // Gemini API requires the first turn in history to be `user`.
    // Since page.tsx only stores AI replies and user answers (hiding the opening prompt),
    // we must prepend the initial prompt to the history.
    if (history.length > 0) {
      history = [initialUserTurn, ...history];
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Try each model in cascade until one succeeds
    let lastError = null;
    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_PROMPT,
        });

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(userMessage);
        const reply = result.response.text();

        console.log(`[/api/interview] Success with model: ${modelName}`);
        return NextResponse.json({ reply });
      } catch (err) {
        const msg = err?.message || "";
        console.warn(`[/api/interview] Model ${modelName} failed: ${msg.slice(0, 120)}`);
        lastError = err;

        // Only try next model on quota (429) or not-found (404) errors
        if (msg.includes("429") || msg.includes("quota") || msg.includes("404") || msg.includes("not found")) {
          continue;
        }
        // For other errors, break early
        throw err;
      }
    }

    // All models exhausted
    const lastMsg = lastError?.message || "";
    if (lastMsg.includes("429") || lastMsg.includes("quota")) {
      return NextResponse.json(
        { error: "AI quota limit reached for today. Please try again tomorrow, or generate a new API key at aistudio.google.com." },
        { status: 503 }
      );
    }

    throw lastError;

  } catch (error) {
    console.error("[/api/interview] Fatal error:", error?.message || error);
    return NextResponse.json(
      { error: "Connection issue, please try again." },
      { status: 500 }
    );
  }
}
