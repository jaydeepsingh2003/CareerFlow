"use client";

import { useResumeStore } from "@/lib/resume-store";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Sparkles, Check, X, Info, 
    Lightbulb, Rocket, Target, 
    Zap, Cpu, BrainCircuit 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TraceTooltip } from "@/components/career/TraceTooltip";
import { useState } from "react";
import { cn } from "@/lib/utils";

type UpgradeMode = 'technical' | 'concise' | 'impact-heavy';

export function AISuggestions() {
    const { aiSuggestions, applySuggestion, dismissSuggestion } = useResumeStore();
    const [mode, setMode] = useState<UpgradeMode>('impact-heavy');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleReanalyze = () => {
        setIsAnalyzing(true);
        setTimeout(() => setIsAnalyzing(false), 2000); // simulate Llama 3.3 call
    };

    if (aiSuggestions.length === 0) {
        return (
            <div className="glass-card p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.02] text-center space-y-8 shadow-2xl overflow-hidden relative">
                {/* Subtle background glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                
                <div className="h-20 w-20 rounded-[2.5rem] bg-indigo-500/10 flex items-center justify-center mx-auto text-indigo-400 border border-indigo-500/20 shadow-2xl relative z-10 animate-morph">
                    <BrainCircuit className="h-10 w-10" />
                </div>
                
                <div className="space-y-3 relative z-10">
                    <h3 className="text-2xl font-black text-white tracking-tight uppercase tracking-widest">AI Career Coach</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed max-w-[240px] mx-auto font-medium">
                        Complete your career profile to unlock high-fidelity AI suggestions optimized for senior-level placement.
                    </p>
                </div>
                
                <div className="pt-2 relative z-10">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Strategic Review</span>
                        <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Pending</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5">
                        <motion.div 
                            className="h-full bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)]" 
                            initial={{ width: 0 }}
                            animate={{ width: '40%' }}
                        />
                    </div>
                </div>
                
                <Button 
                    onClick={handleReanalyze}
                    className="w-full h-14 bg-white text-black hover:bg-gray-100 rounded-2xl font-black gap-3 uppercase text-[10px] tracking-[0.2em] relative z-10 shadow-xl active:scale-95 transition-all"
                >
                    <Sparkles className="h-4 w-4" /> Start AI Analysis
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Engine Controls */}
            <div className="p-4 rounded-[2rem] bg-purple-500/5 border border-purple-500/10 space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Cpu className="h-3 w-3 text-purple-400" />
                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Upgrade Protocol</h4>
                    </div>
                     <TraceTooltip engine="Llama" reason="Llama 3.3 optimized parameters for high-impact professional narrative construction. Zero hallucination policy enforced." />
                </div>
                
                <div className="flex gap-2">
                    {(['technical', 'concise', 'impact-heavy'] as UpgradeMode[]).map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            className={cn(
                                "flex-1 px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter border transition-all",
                                mode === m 
                                    ? "bg-purple-500 text-white border-purple-500 shadow-xl scale-[1.05] z-10" 
                                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                            )}
                        >
                            {m.replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 px-1">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">AI Enhancements</h3>
                <Badge className="ml-auto bg-purple-500/20 text-purple-300 border-purple-500/30 uppercase text-[9px] font-black tracking-widest">
                    {aiSuggestions.length} Traces FOUND
                </Badge>
            </div>

            <AnimatePresence mode="popLayout">
                {aiSuggestions.map((suggestion) => (
                    <motion.div
                        key={suggestion.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-5 rounded-3xl border border-purple-500/20 bg-purple-500/5 space-y-4 group relative overflow-hidden"
                    >
                        {/* Decorative background trace */}
                        <div className="absolute top-0 right-0 p-2 opacity-5">
                            <Zap className="h-20 w-20 text-purple-500" />
                        </div>

                        <div className="flex items-start justify-between gap-4 relative z-10">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                     <TraceTooltip 
                                        engine="Llama" 
                                        label="Reasoning Path"
                                        reason={suggestion.reason}
                                    >
                                         <Badge variant="outline" className="text-[8px] h-4 bg-purple-500/20 border-none text-purple-200 font-black uppercase tracking-widest">
                                            {suggestion.type} Analysis
                                         </Badge>
                                     </TraceTooltip>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                                    {suggestion.reason}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => dismissSuggestion(suggestion.id)}
                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-3 relative z-10">
                            <div className="text-[10px] text-muted-foreground line-through opacity-40 px-3 py-2 bg-black/40 rounded-xl font-mono">
                                {suggestion.original}
                            </div>
                            <div className="text-xs text-white px-3 py-3 bg-white/5 border border-white/10 rounded-xl font-bold flex gap-3 items-start">
                                <div className="h-5 w-5 rounded-md bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                    <Target className="h-3 w-3 text-emerald-400" />
                                </div>
                                {suggestion.suggested}
                            </div>
                        </div>

                        <Button
                            onClick={() => applySuggestion(suggestion.id)}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_5px_15px_rgba(147,51,234,0.3)] active:scale-95 transition-all"
                        >
                            <Check className="h-3 w-3" /> Apply Neural Upgrade
                        </Button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
