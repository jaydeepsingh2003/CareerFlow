"use client";

import { motion } from "framer-motion";
import { useReadinessStore } from "@/lib/store";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export function GapAnalysis() {
    const { plan, isAnalyzing } = useReadinessStore();

    if (isAnalyzing) {
        return (
            <div className="glass-card p-6 rounded-2xl min-h-[200px] flex flex-col items-center justify-center gap-4 border border-white/5">
                <div className="h-10 w-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground animate-pulse">Running AI Comparison Engine...</p>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="glass-card p-10 rounded-2xl text-center border border-dashed border-white/10 opacity-50">
                <p className="text-sm text-muted-foreground italic">Upload or paste a JD above to see your skill gap analysis.</p>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden border border-white/10">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-white">Advanced Gap Analysis</h3>
                <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                    Score: {plan.score}%
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Missing Skills */}
                <div className="space-y-4">
                    <p className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" /> Area of Focus
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {plan.missingSkills.map((skill, i) => (
                            <motion.div
                                key={skill}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-200"
                            >
                                {skill}
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Matched Skills */}
                <div className="space-y-4">
                    <p className="text-xs font-bold text-green-400 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3" /> Strong Proficiency
                    </p>
                    <div className="flex flex-wrap gap-2 opacity-80">
                        <span className="text-xs text-muted-foreground italic">Identified from your profile.</span>
                    </div>
                </div>
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[60px] rounded-full pointer-events-none" />
        </div>
    );
}
