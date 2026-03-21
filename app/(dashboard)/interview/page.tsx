"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Mic, Send, Loader2, Play, CheckCircle, Brain, Target, ArrowRight, Sparkles, Briefcase, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function InterviewPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        }>
            <InterviewContent />
        </Suspense>
    );
}

function InterviewContent() {
    const user = useAuthStore((state) => state.user);
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const prefilledJobId = searchParams.get("jobId");
    const prefilledJobTitle = searchParams.get("jobTitle");

    const [currentInterview, setCurrentInterview] = useState<any>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [view, setView] = useState<"intro" | "session" | "report">("intro");
    const [isListening, setIsListening] = useState(false);
    const [voiceActive, setVoiceActive] = useState(true);

    const speakText = (text: string) => {
        if (!voiceActive || typeof window === 'undefined') return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 0.95;
        // Selection of a premium-sounding voice if available
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Premium'));
        if (preferred) utterance.voice = preferred;
        window.speechSynthesis.speak(utterance);
    };

    const startSTT = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error("Speech Recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setAnswer(prev => prev + (prev ? " " : "") + transcript);
        };

        recognition.start();
    };

    // Queries
    const { data: history } = useQuery({
        queryKey: ["interview-history", user?.id],
        queryFn: () => api.interview.getHistory(user?.id!).then(res => res.data),
        enabled: !!user?.id,
    });

    const { data: jobs } = useQuery({
        queryKey: ["jobs-list"],
        queryFn: () => api.jobs.getFeed().then(res => res.data),
    });

    // Mutations
    const startMutation = useMutation({
        mutationFn: (data: { userId: string, jobTitle?: string }) => api.interview.start(data),
        onSuccess: (res) => {
            setCurrentInterview(res.data);
            setCurrentQuestionIndex(0);
            setView("session");
            toast.success("Interview started!");
            if (res.data.questions?.length > 0) {
                speakText(res.data.questions[0].questionText);
            }
        }
    });

    const submitAnswerMutation = useMutation({
        mutationFn: (data: { questionId: string, answer: string }) => api.interview.submitAnswer(data),
        onSuccess: (res) => {
            const updatedQuestions = [...currentInterview.questions];
            updatedQuestions[currentQuestionIndex] = res.data;
            setCurrentInterview({ ...currentInterview, questions: updatedQuestions });
            toast.success("Answer received.");
            if (res.data.aiFeedback) {
                speakText(res.data.aiFeedback);
            }
        }
    });

    const completeMutation = useMutation({
        mutationFn: (id: string) => api.interview.complete(id),
        onSuccess: (res) => {
            setCurrentInterview(res.data);
            setView("report");
            queryClient.invalidateQueries({ queryKey: ["interview-history", user?.id] });
            toast.success("Interview completed!");
            speakText("Interview complete. Your performance assessment is ready.");
        }
    });

    useEffect(() => {
        if (prefilledJobTitle && !currentInterview && view === "intro") {
            startMutation.mutate({ userId: user?.id!, jobTitle: prefilledJobTitle });
        }
    }, [prefilledJobTitle, currentInterview, view, user?.id, startMutation]);

    useEffect(() => {
        if (view === "session" && currentInterview?.questions[currentQuestionIndex]) {
            const q = currentInterview.questions[currentQuestionIndex];
            if (!q.userAnswer) {
                speakText(q.questionText);
            }
        }
    }, [currentQuestionIndex]);

    const handleNext = () => {
        if (!answer && !currentInterview.questions[currentQuestionIndex].userAnswer) {
            toast.error("Please provide an answer first.");
            return;
        }

        if (currentQuestionIndex < currentInterview.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setAnswer("");
        } else {
            completeMutation.mutate(currentInterview.id);
        }
    };

    const handleAnswerSubmit = () => {
        if (!answer) return;
        submitAnswerMutation.mutate({
            questionId: currentInterview.questions[currentQuestionIndex].id,
            answer
        });
    };

    const currentQuestion = currentInterview?.questions[currentQuestionIndex];

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Video className="h-8 w-8 text-primary" /> AI Mock Interviewer
                    </h1>
                    <p className="text-muted-foreground mt-1">Practice with our adaptive AI to ace your technical and behavioral rounds.</p>
                </div>
                {view === "intro" && (
                    <Button
                        onClick={() => startMutation.mutate({ userId: user?.id!, jobTitle: "Senior Frontend Engineer" })}
                        className="bg-primary hover:bg-primary/90 h-12 px-8 font-bold text-lg shadow-xl shadow-primary/20"
                        disabled={startMutation.isPending}
                    >
                        {startMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Play className="mr-2 h-5 w-5 fill-current" />}
                        Start Instant Session
                    </Button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {view === "intro" && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        <Card className="lg:col-span-2 glass-card p-10 rounded-2xl border-white/5 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Brain className="h-6 w-6 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Technical Rounds</h3>
                                    <p className="text-sm text-muted-foreground">Deep dives into your stacks (React, Node, Java) with coding-logic questions.</p>
                                </div>
                                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                                    <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                        <Target className="h-6 w-6 text-orange-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Behavioral Rounds</h3>
                                    <p className="text-sm text-muted-foreground">STAR method practice for leadership, conflict resolution, and teamwork.</p>
                                </div>
                            </div>

                            <div className="pt-6 space-y-4">
                                <h3 className="text-white font-bold opacity-60 uppercase tracking-widest text-xs">Recent History</h3>
                                <div className="space-y-3">
                                    {history?.length === 0 && <p className="text-sm text-muted-foreground italic">No sessions recorded yet.</p>}
                                    {history?.map((session: any) => (
                                        <div key={session.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {session.score || '--'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{session.jobTitle}</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(session.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" onClick={() => { setCurrentInterview(session); setView("report"); }}>
                                                View Report <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        <div className="space-y-6">
                            <Card className="glass-card p-6 border-primary/20 bg-primary/5">
                                <h3 className="text-primary font-bold mb-3 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" /> AI Coaching Tip
                                </h3>
                                <p className="text-xs text-primary/80 leading-relaxed font-medium">
                                    Maintain eye contact with the camera. Our AI analyzes your pace and confidence as much as the content of your answer.
                                </p>
                            </Card>

                            <div className="glass-card p-6 rounded-2xl border-white/5 space-y-4">
                                <h3 className="text-white font-bold text-sm">Target Roles</h3>
                                <div className="space-y-2">
                                    {jobs?.jobs?.slice(0, 3).map((job: any) => (
                                        <Button
                                            key={job.id}
                                            variant="outline"
                                            className="w-full justify-start border-white/5 bg-white/5 text-xs text-muted-foreground hover:bg-white/10 hover:text-white"
                                            onClick={() => startMutation.mutate({ userId: user?.id!, jobTitle: job.title })}
                                        >
                                            <Briefcase className="mr-2 h-3 w-3" /> Practice for {job.title}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === "session" && (
                    <motion.div
                        key="session"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="grid grid-cols-1 lg:grid-cols-4 gap-8"
                    >
                        {/* Interview Area */}
                        <div className="lg:col-span-3 space-y-6">
                            <Card className="glass-card p-10 rounded-2xl border-primary/10 relative overflow-hidden h-[500px] flex flex-col justify-between">
                                <div className="absolute top-0 right-0 p-6 opacity-10">
                                    <Video className="h-40 w-40 text-primary" />
                                </div>

                                <div className="space-y-8 relative z-10">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-primary/20 text-primary border-primary/20">Question {currentQuestionIndex + 1} of {currentInterview.questions.length}</Badge>
                                        <div className="animate-pulse h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_red]" />
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Live Session</span>
                                    </div>

                                    <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                                        {currentQuestion?.questionText}
                                    </h2>

                                    <div className="pt-4">
                                        <Textarea
                                            placeholder="Type your answer here... (Voice input coming soon)"
                                            className="min-h-[200px] bg-white/5 border-white/10 focus:border-primary/50 text-white p-6 rounded-2xl resize-none text-lg"
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            disabled={!!currentQuestion.userAnswer}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between relative z-10 gap-4">
                                    <div className="flex items-center gap-4">
                                        <Button 
                                            variant="outline" 
                                            onClick={startSTT}
                                            className={cn(
                                                "h-14 w-14 rounded-full border-white/10 bg-white/5 transition-all duration-500",
                                                isListening ? "bg-red-500/20 border-red-500/50 scale-110 shadow-[0_0_20px_rgba(239,68,68,0.3)]" : "text-white"
                                            )}
                                        >
                                            <Mic className={cn("h-6 w-6", isListening && "animate-pulse text-red-500")} />
                                        </Button>
                                        
                                        <Button 
                                            variant="ghost" 
                                            onClick={() => {
                                                setVoiceActive(!voiceActive);
                                                if (!voiceActive) speakText("Vocal guidance activated.");
                                                else window.speechSynthesis.cancel();
                                            }}
                                            className={cn("h-10 px-4 rounded-xl gap-2 font-black uppercase text-[10px] tracking-widest", voiceActive ? "text-primary bg-primary/10" : "text-muted-foreground bg-white/5")}
                                        >
                                            <Volume2 className="h-4 w-4" />
                                            {voiceActive ? "Voice On" : "Voice Off"}
                                        </Button>
                                    </div>

                                    <div className="flex gap-3">
                                        {!currentQuestion.userAnswer ? (
                                            <Button
                                                onClick={handleAnswerSubmit}
                                                className="h-12 px-8 bg-primary hover:bg-primary/90 font-bold"
                                                disabled={submitAnswerMutation.isPending || !answer}
                                            >
                                                {submitAnswerMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-5 w-5" />}
                                                Submit to AI
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={handleNext}
                                                className="h-12 px-10 bg-green-600 hover:bg-green-700 font-bold"
                                            >
                                                Next Question <ArrowRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* AI Real-time Feedback */}
                            {currentQuestion.userAnswer && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex gap-4"
                                >
                                    <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                                        <Sparkles className="h-5 w-5 text-indigo-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">AI Evaluation</p>
                                        <p className="text-sm text-indigo-100 font-medium leading-relaxed italic">
                                            "{currentQuestion.aiFeedback}"
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* Sidebar: Checklist */}
                        <div className="space-y-4">
                            <h3 className="text-white font-bold text-sm px-2">Session Map</h3>
                            <div className="space-y-1">
                                {currentInterview.questions.map((q: any, i: number) => (
                                    <div
                                        key={q.id}
                                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${i === currentQuestionIndex ? 'bg-primary/10 border-primary/20' :
                                            q.userAnswer ? 'bg-green-500/5 border-green-500/10' : 'bg-transparent border-transparent opacity-40'
                                            }`}
                                    >
                                        <span className="text-xs font-medium text-white">Question {i + 1}</span>
                                        {q.userAnswer && <CheckCircle className="h-3 w-3 text-green-500" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === "report" && (
                    <motion.div
                        key="report"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        <Card className="glass-card p-10 rounded-2xl border-primary/10 bg-primary/5 relative overflow-hidden">
                            <div className="flex flex-col md:flex-row items-center gap-10">
                                <div className="relative h-48 w-48 flex items-center justify-center">
                                    <svg className="h-full w-full -rotate-90">
                                        <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                                        <motion.circle
                                            cx="96" cy="96" r="80"
                                            stroke="hsl(var(--primary))"
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={2 * Math.PI * 80}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                                            animate={{ strokeDashoffset: 2 * Math.PI * 80 * (1 - (currentInterview.score || 0) / 100) }}
                                            transition={{ duration: 2 }}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl font-black text-white">{Math.round(currentInterview.score)}</span>
                                        <span className="text-xs font-bold text-muted-foreground uppercase">AI Rank</span>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-green-500/20 text-green-500 border-green-500/20 uppercase font-black text-[10px]">Candidate Pass</Badge>
                                        <span className="text-xs text-muted-foreground">{new Date(currentInterview.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h2 className="text-4xl font-black text-white">{currentInterview.jobTitle}</h2>
                                    <p className="text-lg text-muted-foreground font-medium italic">"{currentInterview.feedback}"</p>

                                    <Button onClick={() => setView("intro")} variant="outline" className="mt-4 border-white/10 hover:bg-white/5">
                                        Back to sessions
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {currentInterview.questions.map((q: any, i: number) => (
                                <Card key={q.id} className="glass-card p-6 rounded-2xl border-white/5 space-y-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <span className="text-xs font-bold text-primary uppercase">Q{i + 1}</span>
                                        <Badge variant="outline" className="text-green-400 border-green-400/20">{q.score || 0}/10</Badge>
                                    </div>
                                    <h4 className="text-lg font-bold text-white mb-2">{q.questionText}</h4>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-muted-foreground italic line-clamp-3">
                                        {q.userAnswer}
                                    </div>
                                    <div className="pt-2 border-t border-white/5">
                                        <p className="text-xs font-bold text-indigo-400 uppercase mb-2">AI Feedback</p>
                                        <p className="text-xs font-medium text-muted-foreground leading-relaxed">{q.aiFeedback}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
