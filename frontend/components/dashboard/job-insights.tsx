"use client";

import { Brain, Star, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export function JobInsights() {
    const user = useAuthStore((state) => state.user);

    const { data: scoreData, isLoading } = useQuery({
        queryKey: ["readiness-score", user?.id],
        queryFn: () => api.readiness.getScore(user?.id!).then(res => res.data),
        enabled: !!user?.id,
    });

    const score = scoreData?.currentScore || 0;

    const getSuggestions = (score: number) => {
        if (score > 80) return [
            { text: "Your profile is in the top 5% for React roles.", type: "strength" },
            { text: "Highlight leadership roles to unlock 'Senior' matches.", type: "improvement" }
        ];
        if (score > 50) return [
            { text: "Strong foundational knowledge identified.", type: "strength" },
            { text: "Focus on 'Cloud Deployment' to increase match rate by 20%.", type: "improvement" }
        ];
        return [
            { text: "Active learning detected in your recent activity.", type: "strength" },
            { text: "Complete more skill assessments to boost your score.", type: "improvement" }
        ];
    };

    const suggestions = getSuggestions(score);

    if (isLoading) return (
        <div className="glass-card p-6 rounded-2xl flex items-center justify-center min-h-[250px]">
            <Loader2 className="animate-spin text-purple-400" />
        </div>
    );

    return (
        <div className="glass-card p-6 rounded-2xl col-span-1 lg:col-span-1 md:col-span-2 relative overflow-hidden border border-white/5">
            <div className="flex items-center gap-2 mb-4 text-purple-400">
                <Brain className="h-5 w-5 animate-pulse" />
                <h3 className="font-bold uppercase tracking-wider text-[10px] text-white">AI Strategy Engine</h3>
            </div>

            <div className="space-y-4 relative z-10">
                <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl backdrop-blur-sm shadow-[inset_0_0_20px_rgba(168,85,247,0.05)]">
                    <p className="text-xs font-medium text-purple-200 leading-relaxed uppercase tracking-tight">
                        {score > 70
                            ? "Elite Performance. We recommend starting 'Mock Interviews' for high-tier roles."
                            : "Growth Mode. Focus on 'Gap Analysis' tasks to bridge the skill deficit."}
                    </p>
                </div>

                <div className="space-y-3">
                    {suggestions.map((s, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + i * 0.2 }}
                            className="flex items-start gap-3 p-3 hover:bg-white/5 rounded-xl transition-colors group cursor-default"
                        >
                            <div className={`mt-0.5 h-6 w-6 rounded-lg flex items-center justify-center ${s.type === 'strength' ? 'bg-yellow-400/10 text-yellow-400' : 'bg-blue-400/10 text-blue-400'}`}>
                                <Star className={`h-3.5 w-3.5 ${s.type === 'strength' ? 'fill-current' : ''}`} />
                            </div>
                            <p className="text-[11px] font-medium text-muted-foreground group-hover:text-white transition-colors leading-normal">{s.text}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full" />
        </div>
    );
}
