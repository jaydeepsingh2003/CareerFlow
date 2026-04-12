"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Brain, ChevronRight, Loader2, Send, Volume2, VolumeX,
  Timer, RotateCcw, Zap, Code2, Server, Database, GitBranch, Layout
} from "lucide-react";
import { toast } from "sonner";

const VoiceInput = dynamic(() => import("@/components/VoiceInput"), { ssr: false });
const ScoreCard = dynamic(() => import("@/components/ScoreCard"), { ssr: false });
import AIAvatar from "@/components/AIAvatar";

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen = "setup" | "interview" | "results";
type Difficulty = "Easy" | "Medium" | "Hard";
type Message = { role: "ai" | "user"; content: string };

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_QUESTIONS = 5;
const TIMER_SECONDS = 60;

const TOPICS = [
  { id: "frontend", label: "Frontend Dev",  Icon: Layout,    color: "from-blue-500/20 to-cyan-500/10 border-blue-500/30 text-blue-300" },
  { id: "backend",  label: "Backend Dev",   Icon: Server,    color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300" },
  { id: "python",   label: "Python",        Icon: Code2,     color: "from-yellow-500/20 to-amber-500/10 border-yellow-500/30 text-yellow-300" },
  { id: "dsa",      label: "DSA",           Icon: GitBranch, color: "from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-300" },
  { id: "system",   label: "System Design", Icon: Database,  color: "from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-300" },
] as const;

const DIFFICULTIES: { id: Difficulty; desc: string; dotColor: string }[] = [
  { id: "Easy",   desc: "Fundamental concepts", dotColor: "bg-emerald-400" },
  { id: "Medium", desc: "Real-world scenarios",  dotColor: "bg-amber-400" },
  { id: "Hard",   desc: "Expert-level depth",    dotColor: "bg-red-400" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InterviewStudioPage() {
  const [screen, setScreen]           = useState<Screen>("setup");
  const [topic, setTopic]             = useState<string | null>(null);
  const [difficulty, setDifficulty]   = useState<Difficulty>("Medium");
  const [messages, setMessages]       = useState<Message[]>([]);
  const [answer, setAnswer]           = useState<string>("");
  const [loading, setLoading]         = useState<boolean>(false);
  const [questionNum, setQuestionNum] = useState<number>(0);
  const [voiceOn, setVoiceOn]         = useState<boolean>(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState<boolean>(false);
  const [timer, setTimer]             = useState<number>(TIMER_SECONDS);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [sessionError, setSessionError] = useState<string>("");

  const timerRef   = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const answerRef  = useRef<string>(answer);
  const messagesRef = useRef<Message[]>(messages);
  answerRef.current   = answer;
  messagesRef.current = messages;

  // ── Speech Synthesis ──────────────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    if (!voiceOn || typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate  = 0.95;
    utt.pitch = 0.95;
    const voices = window.speechSynthesis.getVoices();
    
    // Ranked array of the best most natural female voices across platforms
    const bestFemaleVoices = [
      "Google US English",     // Chrome's high-quality cloud voice
      "Google UK English Female", 
      "Microsoft Aria",        // Windows 11 natural voice
      "Microsoft Zira",        // Windows 10/11 standard
      "Microsoft Hazel",
      "Samantha",              // macOS premium
      "Karen",                 // macOS generic female
      "Premium Female",
      "Natural Female"
    ];

    // Find the first voice that matches our ranked list
    let preferred = null;
    for (const voiceName of bestFemaleVoices) {
      preferred = voices.find((v) => v.name.includes(voiceName));
      if (preferred) break;
    }

    // Fallback: any female voice, then any English voice, then whatever is first
    if (!preferred) {
      preferred = voices.find(v => v.name.includes("Female") && v.lang.startsWith("en")) 
               || voices.find(v => v.lang.startsWith("en-US"))
               || voices[0];
    }

    if (preferred) utt.voice = preferred;
    utt.onstart = () => setIsAiSpeaking(true);
    utt.onend = () => setIsAiSpeaking(false);
    utt.onerror = () => setIsAiSpeaking(false);
    
    window.speechSynthesis.speak(utt);
  }, [voiceOn]);

  // ── Timer ─────────────────────────────────────────────────────────────────
  const stopTimer = useCallback(() => {
    setTimerActive(false);
    clearInterval(timerRef.current);
  }, []);

  const startTimer = useCallback(() => {
    clearInterval(timerRef.current);
    setTimer(TIMER_SECONDS);
    setTimerActive(true);
  }, []);

  // ── API Call ──────────────────────────────────────────────────────────────
  const callInterviewAPI = useCallback(async (history: Message[]) => {
    setLoading(true);
    setSessionError("");
    try {
      const topicLabel = TOPICS.find((t) => t.id === topic)?.label ?? topic ?? "";
      const res = await fetch("/api/interview", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicLabel, difficulty, conversationHistory: history }),
      });

      if (res.status === 429) {
        setSessionError("Interview session complete. Start a new one!");
        setScreen("results");
        return undefined;
      }

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Connection issue, please try again.");
      }

      const data = await res.json() as { reply: string };
      const aiMessage: Message = { role: "ai", content: data.reply };
      setMessages((prev) => [...prev, aiMessage]);

      // Speak the feedback and the next question combined, but avoid reading the raw "Next Question:" prefix.
      // On the first question, we want to hear the full introduction.
      let textToSpeak = data.reply;
      if (history.length > 0) {
        // Subsequent turns: typically we just want to speak the Feedback and the Next Question
        // The backend might return "Score: X\nFeedback: Y\nNext Question: Z"
        // We strip "Score: X" if present to make it sound conversational.
        textToSpeak = textToSpeak.replace(/Score:\s*[^\n]+[\n\r]+/i, "");
        textToSpeak = textToSpeak.replace(/Feedback:/i, "");
      }
      // Always remove the explicit "Next Question:" label for a natural voice transition
      textToSpeak = textToSpeak.replace(/Next Question:/i, "");
      
      speak(textToSpeak.trim());

      if (data.reply.includes("Final Score:")) {
        stopTimer();
        setTimeout(() => setScreen("results"), 800);
      } else {
        startTimer();
      }

      return [...history, aiMessage];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection issue, please try again.";
      setSessionError(msg);
      toast.error(msg);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [topic, difficulty, speak, startTimer, stopTimer]);

  // ── Timer tick ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!timerActive) return;
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimerActive(false);
          const currentAnswer = answerRef.current.trim();
          const currentMessages = messagesRef.current;
          const userText = currentAnswer || "(No answer provided — time expired)";
          const userMessage: Message = { role: "user", content: userText };
          const newHistory = [...currentMessages, userMessage];
          setMessages(newHistory);
          setAnswer("");
          setQuestionNum((q) => q + 1);
          void callInterviewAPI(newHistory);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerActive]);

  // ── Start Interview ───────────────────────────────────────────────────────
  const handleStart = async () => {
    if (!topic) { toast.error("Please select a topic first."); return; }
    setMessages([]);
    setAnswer("");
    setQuestionNum(0);
    setSessionError("");
    setScreen("interview");
    window.speechSynthesis?.cancel();
    await callInterviewAPI([]);
  };

  // ── Submit Answer ─────────────────────────────────────────────────────────
  const handleSubmitAnswer = useCallback(async (overrideAnswer?: string) => {
    stopTimer();
    const currentMessages = messagesRef.current;
    const userText = (overrideAnswer ?? answerRef.current).trim();
    if (!userText) { toast.error("Please provide an answer."); return; }

    const userMessage: Message = { role: "user", content: userText };
    const newHistory: Message[] = [...currentMessages, userMessage];
    setMessages(newHistory);
    setAnswer("");
    setQuestionNum((prev) => prev + 1);
    await callInterviewAPI(newHistory);
  }, [callInterviewAPI, stopTimer]);

  // ── Retry ─────────────────────────────────────────────────────────────────
  const handleRetry = () => {
    stopTimer();
    setScreen("setup");
    setMessages([]);
    setAnswer("");
    setQuestionNum(0);
    setSessionError("");
    setTimer(TIMER_SECONDS);
    window.speechSynthesis?.cancel();
  };

  // ── derived ───────────────────────────────────────────────────────────────
  const progress   = Math.min((questionNum / MAX_QUESTIONS) * 100, 100);
  const timerPct   = (timer / TIMER_SECONDS) * 100;
  const timerColor = timer > 30 ? "#10b981" : timer > 10 ? "#f59e0b" : "#ef4444";
  const RING_R     = 17;
  const RING_C     = 2 * Math.PI * RING_R;

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto pb-24 space-y-8 px-2">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
              <Brain className="h-5 w-5 text-violet-400" />
            </div>
            AI Mock Interviewer
          </h1>
          <p className="text-white/50 text-sm mt-1 ml-1">Gemini-powered • Voice-enabled • Free</p>
        </div>

        {screen === "interview" && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setVoiceOn((v) => !v); window.speechSynthesis?.cancel(); }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold text-white/60"
            >
              {voiceOn
                ? <Volume2 className="h-3.5 w-3.5 text-violet-400" />
                : <VolumeX  className="h-3.5 w-3.5" />}
              {voiceOn ? "Voice On" : "Voice Off"}
            </button>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold text-white/60"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        )}
      </div>

      {/* ── SETUP SCREEN ──────────────────────────────────────────────────── */}
      {screen === "setup" && (
        <div className="space-y-8">

          {/* Topic */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/50">1. Choose Topic</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {TOPICS.map(({ id, label, Icon, color }) => {
                const sel = topic === id;
                return (
                  <button
                    key={id}
                    onClick={() => setTopic(id)}
                    className={[
                      "flex flex-col items-center gap-3 p-4 rounded-2xl border bg-gradient-to-br transition-all duration-200",
                      sel
                        ? `${color} scale-105 shadow-lg`
                        : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:border-white/20",
                    ].join(" ")}
                  >
                    <Icon className={`h-6 w-6 ${sel ? "" : "opacity-50"}`} />
                    <span className="text-xs font-bold leading-tight text-center">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/50">2. Choose Difficulty</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              {DIFFICULTIES.map(({ id, desc, dotColor }) => (
                <button
                  key={id}
                  onClick={() => setDifficulty(id)}
                  className={[
                    "flex-1 flex items-center gap-3 px-5 py-4 rounded-xl border transition-all",
                    difficulty === id
                      ? "bg-violet-500/20 border-violet-500/40 text-white"
                      : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10",
                  ].join(" ")}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${dotColor} shrink-0`} />
                  <div className="text-left">
                    <p className="text-sm font-bold">{id}</p>
                    <p className="text-[11px] opacity-60">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Info bar */}
          <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 px-5 py-3 flex flex-wrap gap-4 text-xs text-violet-300">
            <span className="flex items-center gap-1.5"><Zap   className="h-3 w-3" /> 5 questions per session</span>
            <span className="flex items-center gap-1.5"><Timer  className="h-3 w-3" /> 60s per question</span>
            <span className="flex items-center gap-1.5"><Volume2 className="h-3 w-3" /> Voice input &amp; output</span>
          </div>

          {/* Start */}
          <button
            onClick={handleStart}
            disabled={!topic}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-black text-lg text-white shadow-xl shadow-violet-500/20"
          >
            <Brain className="h-5 w-5" /> Start Interview <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* ── INTERVIEW SCREEN ───────────────────────────────────────────────── */}
      {screen === "interview" && (
        <div className="flex flex-col min-h-[60vh] justify-between">
          
          {/* Top Bar: Progress + Timer */}
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-white/40">
                <span>Progress</span>
                <span>Question {Math.min(questionNum + 1, MAX_QUESTIONS)} of {MAX_QUESTIONS}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="shrink-0 h-12 w-12 relative flex items-center justify-center bg-white/5 rounded-full border border-white/10">
              <div className="absolute inset-0">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r={RING_R} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                  <circle
                    cx="20" cy="20" r={RING_R}
                    fill="transparent"
                    stroke={timerColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={RING_C}
                    strokeDashoffset={RING_C * (1 - timerPct / 100)}
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>
              </div>
              <Timer className={`h-4 w-4 relative z-10 ${timer <= 10 ? "text-red-400 animate-pulse" : "text-white/70"}`} />
            </div>
          </div>

          {/* Center: Voice Visualizer Workspace */}
          <div className="flex flex-col items-center justify-center flex-1 py-12">
            
            {/* Visualizer Orb */}
            <div className="relative mb-16">
              <AIAvatar 
                currentState={
                  isAiSpeaking ? "speaking" : loading ? "thinking" : "idle"
                } 
              />
            </div>

            {/* Error Message */}
            {sessionError && (
              <div className="mb-8 rounded-xl bg-red-500/10 border border-red-500/20 px-6 py-4 text-sm text-red-300 max-w-md text-center">
                {sessionError}
              </div>
            )}

            {/* Main Interaction: Voice Input */}
            <div className="w-full flex-col flex items-center">
              <VoiceInput 
                value={answer} 
                onChange={setAnswer} 
                onStopRecording={() => void handleSubmitAnswer()} 
                disabled={loading} 
              />
              
              {/* Subtle transcript display */}
              {answer.trim() && (
                <div className="mt-8 px-6 py-4 rounded-xl bg-white/5 border border-white/10 max-w-lg w-full">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Heard Transcript</p>
                  <p className="text-sm text-white/80 italic leading-relaxed">"{answer}"</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── RESULTS SCREEN ────────────────────────────────────────────────── */}
      {screen === "results" && (
        <ScoreCard messages={messages} onRetry={handleRetry} />
      )}
    </div>
  );
}
