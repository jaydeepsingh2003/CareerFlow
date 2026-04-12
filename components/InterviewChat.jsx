"use client";

import { useEffect, useRef } from "react";
import { Sparkles, User, Loader2 } from "lucide-react";

function parseAIMessage(text) {
  // Check for Final Score block
  if (text.includes("Final Score:")) {
    const finalScore = text.match(/Final Score:\s*(\d+\/50)/)?.[1] || "";
    const summary = text.match(/Summary:\s*(.+?)(?=Strong Areas:|Improve On:|$)/s)?.[1]?.trim() || "";
    const strongAreas = text.match(/Strong Areas:\s*(.+?)(?=Improve On:|$)/s)?.[1]?.trim() || "";
    const improveOn = text.match(/Improve On:\s*(.+?)$/s)?.[1]?.trim() || "";
    return { type: "final", finalScore, summary, strongAreas, improveOn, raw: text };
  }

  // Check for Score/Feedback/Next Question block
  if (text.includes("Score:") || text.includes("Feedback:")) {
    const score = text.match(/Score:\s*(\d+\/10)/)?.[1] || "";
    const feedback = text.match(/Feedback:\s*(.+?)(?=Next Question:|$)/s)?.[1]?.trim() || "";
    const nextQuestion = text.match(/Next Question:\s*(.+?)$/s)?.[1]?.trim() || "";
    return { type: "feedback", score, feedback, nextQuestion, raw: text };
  }

  // Plain question / intro
  return { type: "question", raw: text };
}

function AIBubble({ text, loading }) {
  if (loading) {
    return (
      <div className="flex items-start gap-3 max-w-[85%]">
        <div className="h-8 w-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0 mt-1">
          <Sparkles className="h-4 w-4 text-violet-400" />
        </div>
        <div className="rounded-2xl rounded-tl-sm px-5 py-4 bg-white/5 border border-white/10 flex items-center gap-3">
          <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
          <span className="text-sm text-white/60 italic">AI is thinking…</span>
        </div>
      </div>
    );
  }

  const parsed = parseAIMessage(text);

  if (parsed.type === "feedback") {
    return (
      <div className="flex items-start gap-3 max-w-[88%]">
        <div className="h-8 w-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0 mt-1">
          <Sparkles className="h-4 w-4 text-violet-400" />
        </div>
        <div className="space-y-2 w-full">
          {/* Score pill */}
          {parsed.score && (
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              {parsed.score}
            </span>
          )}
          {/* Feedback */}
          {parsed.feedback && (
            <div className="rounded-2xl rounded-tl-sm px-5 py-4 bg-violet-500/10 border border-violet-500/20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-2">Feedback</p>
              <p className="text-sm text-white/80 leading-relaxed">{parsed.feedback}</p>
            </div>
          )}
          {/* Next Question */}
          {parsed.nextQuestion && (
            <div className="rounded-2xl rounded-tl-sm px-5 py-4 bg-white/5 border border-white/10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2">Next Question</p>
              <p className="text-base font-semibold text-white leading-relaxed">{parsed.nextQuestion}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Plain question
  return (
    <div className="flex items-start gap-3 max-w-[85%]">
      <div className="h-8 w-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0 mt-1">
        <Sparkles className="h-4 w-4 text-violet-400" />
      </div>
      <div className="rounded-2xl rounded-tl-sm px-5 py-4 bg-white/5 border border-white/10">
        <p className="text-sm font-semibold text-white leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

function UserBubble({ text }) {
  return (
    <div className="flex items-start justify-end gap-3 max-w-[80%] ml-auto">
      <div className="rounded-2xl rounded-tr-sm px-5 py-4 bg-violet-600/30 border border-violet-500/30">
        <p className="text-sm text-white/90 leading-relaxed">{text}</p>
      </div>
      <div className="h-8 w-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-1">
        <User className="h-4 w-4 text-white/60" />
      </div>
    </div>
  );
}

export default function InterviewChat({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="flex flex-col gap-5 overflow-y-auto pr-1 py-2" style={{ maxHeight: "420px" }}>
      {messages.map((msg, i) =>
        msg.role === "ai" ? (
          <AIBubble key={i} text={msg.content} />
        ) : (
          <UserBubble key={i} text={msg.content} />
        )
      )}
      {loading && <AIBubble loading />}
      <div ref={bottomRef} />
    </div>
  );
}
