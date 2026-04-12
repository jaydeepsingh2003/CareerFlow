"use client";

import { useEffect, useState, useRef } from "react";
import { Trophy, TrendingUp, AlertTriangle, RotateCcw, CheckCircle2 } from "lucide-react";

function parseScoreCard(messages) {
  // Find the final AI message that has "Final Score:"
  const finalMsg = [...messages].reverse().find(
    (m) => m.role === "ai" && m.content.includes("Final Score:")
  );
  if (!finalMsg) return null;

  const text = finalMsg.content;
  const scoreMatch = text.match(/Final Score:\s*(\d+)\/50/);
  const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
  const summary = text.match(/Summary:\s*(.+?)(?=Strong Areas:|Improve On:|$)/s)?.[1]?.trim() || "";
  const strongRaw = text.match(/Strong Areas:\s*(.+?)(?=Improve On:|$)/s)?.[1]?.trim() || "";
  const improveRaw = text.match(/Improve On:\s*(.+?)$/s)?.[1]?.trim() || "";

  const strongAreas = strongRaw.split(/,|\n/).map((s) => s.trim()).filter(Boolean);
  const improveOn = improveRaw.split(/,|\n/).map((s) => s.trim()).filter(Boolean);

  // Per-question scores from feedback messages
  const questionScores = [];
  messages.forEach((m) => {
    if (m.role === "ai") {
      const match = m.content.match(/Score:\s*(\d+)\/10/);
      if (match) questionScores.push(parseInt(match[1], 10));
    }
  });

  return { score, summary, strongAreas, improveOn, questionScores };
}

export default function ScoreCard({ messages, onRetry }) {
  const data = parseScoreCard(messages);
  const [animated, setAnimated] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timerRef.current);
  }, []);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-white/50 text-sm">Calculating your results…</p>
      </div>
    );
  }

  const { score, summary, strongAreas, improveOn, questionScores } = data;
  const percentage = (score / 50) * 100;

  // Ring math
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = animated
    ? circumference * (1 - percentage / 100)
    : circumference;

  const grade =
    percentage >= 80 ? { label: "Excellent", color: "text-emerald-400" }
    : percentage >= 60 ? { label: "Good", color: "text-violet-400" }
    : percentage >= 40 ? { label: "Average", color: "text-amber-400" }
    : { label: "Needs Work", color: "text-red-400" };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-white/5 to-transparent p-8">
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Score ring */}
          <div className="relative h-44 w-44 shrink-0">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="hsl(263,70%,60%)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">{score}</span>
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest">/ 50</span>
              <span className={`text-xs font-bold uppercase mt-1 ${grade.color}`}>{grade.label}</span>
            </div>
          </div>

          {/* Summary */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              <span className="text-lg font-black text-white">Interview Complete!</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">{summary}</p>

            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600/30 border border-violet-500/40 hover:bg-violet-600/50 transition-all text-sm font-bold text-white"
            >
              <RotateCcw className="h-4 w-4" /> Try Another Interview
            </button>
          </div>
        </div>
      </div>

      {/* Strong areas + improve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strongAreas.length > 0 && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Strong Areas</span>
            </div>
            <ul className="space-y-2">
              {strongAreas.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {improveOn.length > 0 && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Improve On</span>
            </div>
            <ul className="space-y-2">
              {improveOn.map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Per-question score breakdown */}
      {questionScores.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">Per-Question Scores</p>
          <div className="flex flex-wrap gap-3">
            {questionScores.map((s, i) => {
              const pct = (s / 10) * 100;
              const color = pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-violet-500" : "bg-red-500";
              return (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className="h-16 w-8 rounded-full bg-white/5 border border-white/10 flex flex-col-reverse overflow-hidden relative">
                    <div
                      className={`${color} rounded-full transition-all duration-1000`}
                      style={{ height: animated ? `${pct}%` : "0%" }}
                    />
                  </div>
                  <span className="text-[10px] text-white/50 font-bold">Q{i + 1}</span>
                  <span className="text-[10px] text-white font-black">{s}/10</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
