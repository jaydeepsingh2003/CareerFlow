"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Brain, Sparkles, Send, BrainCircuit, 
    Bot, User, ChevronRight, CheckCircle2, 
    Zap, Rocket, Target, Info 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/lib/store";
import { useAICareerStore } from "@/lib/ai-career-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/lib/api";

type Message = {
    role: 'bot' | 'user';
    content: string;
    thinking?: boolean;
    analysis?: {
        skills: { name: string, score: number }[];
        domain: string;
        confidence: number;
    };
};

export default function AIAssessmentPage() {
    const { user } = useAuthStore();
    const { updateSkillScore, persistSkills } = useAICareerStore();
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isBotTyping, setIsBotTyping] = useState(false);
    const [step, setStep] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initial sequence
    useEffect(() => {
        if (messages.length === 0 && user?.id) {
            const init = async () => {
                try {
                    const res = await api.careerEngine.startAssessment(user.id);
                    handleBotTurn(res.data.greeting);
                } catch (e) {
                    handleBotTurn("Initialize Identity Assessment v4.1. Accessing neural profile... Hello. I am Qwen, your intelligence evaluator.");
                }
            };
            init();
        }
    }, [messages, user?.id]);

    const handleBotTurn = async (content: string, analysis?: any) => {
        setIsBotTyping(true);
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                role: 'bot', 
                content, 
                analysis 
            }]);
            setIsBotTyping(false);
        }, 800);
    };

    const handleSend = async () => {
        if (!inputValue.trim() || isBotTyping || isComplete || !user?.id) return;

        const userMsg = inputValue;
        setInputValue("");
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        
        const nextStep = step + 1;
        setStep(nextStep);

        setIsBotTyping(true);
        
        try {
            // Integration with Qwen-driven backend
            const res = await api.careerEngine.submitAnswer("current", {
                userId: user.id,
                answer: userMsg,
                currentStep: step
            });
            
            const feedback = res.data.feedback;
            const nextQuestion = res.data.nextQuestion;
            const backendComplete = res.data.isComplete;
            const suggestedSkills = res.data.suggestedSkills || [];

            // Applying Skill Fusion based on real-time evaluation
            suggestedSkills.forEach((s: any) => {
                updateSkillScore(s.name, s.score, 0); 
            });

            if (backendComplete) {
                setTimeout(async () => {
                    await persistSkills(user.id);
                    handleBotTurn(
                        `${feedback} Assessment Cycle Complete. I have extracted your skill matrix with high confidence. Transitioning to Micro-Simulation Phase for deterministic validation.`,
                        { skills: suggestedSkills, domain: "AI Analyzed Domain", confidence: 0.92 }
                    );
                    setIsComplete(true);
                }, 1000);
            } else {
                setTimeout(() => {
                    handleBotTurn(`${feedback} ${nextQuestion}`);
                }, 1000);
            }
        } catch (error) {
            toast.error("Cognitive Engine Timeout: Re-syncing local fallback...");
            setIsBotTyping(false);
        }
    }

    return (
        <div className="min-h-full pb-20 max-w-5xl mx-auto flex flex-col h-[calc(100vh-180px)]">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                        <BrainCircuit className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight uppercase">AI Assessment <span className="text-primary italic">Engine</span></h1>
                        <div className="flex items-center gap-2">
                             <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Cognitive Cluster Live: Qwen-v4</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Neural Depth progress</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={cn(
                                    "h-1 w-6 rounded-full transition-all",
                                    i <= step ? "bg-primary" : "bg-white/10"
                                )} />
                            ))}
                        </div>
                    </div>
                    <Badge variant="outline" className="h-8 border-white/10 bg-white/5 text-white gap-2 px-3">
                        <Zap className="h-3 w-3 text-primary fill-primary" /> Confidence: 88%
                    </Badge>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 p-4 mb-8">
                <AnimatePresence mode="popLayout">
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={cn(
                                "flex gap-4 max-w-[85%]",
                                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                            )}
                        >
                            <div className={cn(
                                "h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center border transition-all",
                                msg.role === 'bot' 
                                    ? "bg-primary/20 border-primary/20 text-primary" 
                                    : "bg-white/5 border-white/10 text-white"
                            )}>
                                {msg.role === 'bot' ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                            </div>

                            <div className="space-y-3">
                                <div className={cn(
                                    "p-5 rounded-3xl text-sm leading-relaxed",
                                    msg.role === 'bot' 
                                        ? "bg-white/[0.03] border border-white/5 text-gray-200" 
                                        : "bg-primary text-white font-medium"
                                )}>
                                    {msg.content}
                                </div>

                                {msg.analysis && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                             <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                                                <Target className="h-3 w-3" /> Skill Matrix Extraction
                                             </h4>
                                             <span className="text-[10px] text-muted-foreground">Trace: Adaptive-Mapping</span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {msg.analysis.skills.map(s => (
                                                <div key={s.name} className="p-2 rounded-xl bg-black/20 border border-white/5 space-y-1">
                                                     <div className="flex items-center justify-between text-[10px]">
                                                        <span className="text-white font-bold">{s.name}</span>
                                                        <span className="text-emerald-400">{(s.score * 100).toFixed(0)}%</span>
                                                     </div>
                                                     <Progress value={s.score * 100} className="h-1 bg-white/5" indicatorClassName="bg-emerald-500" />
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {isBotTyping && (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            className="flex gap-4 items-center pl-4"
                        >
                             <div className="h-10 w-10 shrink-0 rounded-2xl bg-primary/20 border border-primary/20 text-primary flex items-center justify-center">
                                <BrainCircuit className="h-5 w-5 animate-pulse" />
                            </div>
                            <div className="flex gap-1.5 p-4 rounded-3xl bg-white/[0.03] border border-white/5">
                                <div className="h-1 w-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="h-1 w-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="h-1 w-1 bg-primary rounded-full animate-bounce" />
                            </div>
                            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest animate-pulse">Running Neural Inference...</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={chatEndRef} />
            </div>

            {/* Input Container */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-blue-500/50 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-1000" />
                <div className="relative flex items-center bg-[#07070B] border border-white/10 rounded-2xl p-2 h-16 shadow-2xl">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isBotTyping || isComplete}
                        placeholder={isComplete ? "Identity Assessment Finalized" : "Describe your technical approach..."}
                        className="flex-1 bg-transparent border-none focus:ring-0 outline-none px-4 text-white text-sm disabled:opacity-50"
                    />
                    
                    {!isComplete ? (
                        <Button 
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isBotTyping}
                            className="h-12 px-6 bg-primary hover:bg-primary/90 text-white rounded-xl gap-2 transition-all active:scale-95"
                        >
                            Transmit <Send className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button 
                            onClick={() => window.location.href = '/simulation'}
                            className="h-12 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-2 animate-bounce"
                        >
                            Next: Micro-Simulation <Rocket className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Hint / Trace Tooltip */}
            <div className="mt-6 flex items-center justify-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-50">
                <div className="flex items-center gap-1.5">
                    <Info className="h-3 w-3" /> Adaptive Questioning Enabled
                </div>
                <div className="h-1 w-1 rounded-full bg-white/20" />
                <div className="flex items-center gap-1.5">
                    <Brain className="h-3 w-3" /> Qwen Decision Trace: ACTIVE
                </div>
            </div>
        </div>
    );
}
