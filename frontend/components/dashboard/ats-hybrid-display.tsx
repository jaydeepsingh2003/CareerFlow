"use client";

import { motion } from "framer-motion";
import {
    Target,
    Zap,
    BarChart3,
    CheckCircle2,
    AlertCircle,
    Lightbulb,
    ShieldCheck,
    ChevronRight,
    Search
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface HybridATSDisplayProps {
    data: {
        score: number;
        skillOverlap: number;
        similarityScore: number;
        quantificationScore: number;
        missingSkills: string[];
        suggestions: string[];
        confidence: number;
        summary?: string;
    }
}

import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export function HybridATSDisplay({ data, jobId }: HybridATSDisplayProps & { jobId?: string }) {
    const user = useAuthStore((state) => state.user);
    const [generating, setGenerating] = useState(false);

    const handleGeneratePlan = async () => {
        if (!user || !jobId) return;
        setGenerating(true);
        try {
            await api.readiness.generate(user.id, jobId);
            toast.success("Personalized Learning Plan Generated!");
            // Ideally redirect or show modal
        } catch (e) {
            toast.error("Failed to generate plan");
        } finally {
            setGenerating(false);
        }
    };

    const metrics = [
        { label: "Skill-Set Overlap", value: data.skillOverlap, icon: Target, color: "text-blue-400", bg: "bg-blue-500/10" },
        { label: "Semantic Similarity", value: data.similarityScore, icon: Search, color: "text-purple-400", bg: "bg-purple-500/10" },
        { label: "Impact Quantification", value: data.quantificationScore, icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10" },
    ];

    return (
        <div className="space-y-8">
            {/* Header: Score & Summary */}
            <div className="text-center space-y-4">
                <div className="relative inline-block">
                    <svg className="h-32 w-32 transform -rotate-90">
                        <circle
                            cx="64"
                            cy="64"
                            r="58"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-white/5"
                        />
                        <motion.circle
                            cx="64"
                            cy="64"
                            r="58"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={364.4}
                            initial={{ strokeDashoffset: 364.4 }}
                            animate={{ strokeDashoffset: 364.4 - (364.4 * data.score) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="text-primary"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-white">{data.score}%</span>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">ATS Score</span>
                    </div>
                </div>
                <div className="max-w-md mx-auto">
                    <p className="text-muted-foreground text-sm italic">{data.summary || "Technical audit completed via AI Hybrid Engine."}</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {metrics.map((m, idx) => (
                    <motion.div
                        key={m.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`${m.bg} p-4 rounded-xl border border-white/5 space-y-3`}
                    >
                        <div className="flex items-center justify-between">
                            <m.icon className={`h-5 w-5 ${m.color}`} />
                            <span className="text-sm font-bold text-white">{m.value}%</span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground uppercase font-bold">{m.label}</p>
                            <Progress value={m.value} className="h-1 bg-white/5" />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Critical Gaps & Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Missing Skills */}
                <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-400" />
                        Key Talent Gaps
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {data.missingSkills.length > 0 ? (
                            data.missingSkills.map((skill) => (
                                <Badge key={skill} variant="outline" className="bg-orange-500/5 text-orange-200 border-orange-500/20 py-1">
                                    {skill}
                                </Badge>
                            ))
                        ) : (
                            <p className="text-xs text-muted-foreground">No significant skill gaps detected.</p>
                        )}
                    </div>
                </div>

                {/* AI Suggestions */}
                <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-primary" />
                        Optimization Tips
                    </h4>
                    <ul className="space-y-3">
                        {data.suggestions.map((tip, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                                <ChevronRight className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Action Bar - Generate Plan */}
            {data.score < 90 && jobId && (
                <div className="flex justify-center pt-8 pb-4">
                    <Button
                        onClick={handleGeneratePlan}
                        disabled={generating}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold h-14 px-8 rounded-xl shadow-xl shadow-indigo-500/20 group transition-all"
                    >
                        {generating ? (
                            <>
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                                Crafting Your Plan...
                            </>
                        ) : (
                            <>
                                <BookOpen className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                                Generate Gap-Closing Plan
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Verification Tag */}
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/5 mt-8">
                <ShieldCheck className="h-4 w-4 text-emerald-500/50" />
                <span className="text-[10px] text-muted-foreground/60 uppercase font-medium">
                    Verified by KodNest Hybrid Engine (Conf: {(data.confidence * 100).toFixed(0)}%)
                </span>
            </div>
        </div>
    );
}
