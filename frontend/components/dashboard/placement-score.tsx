"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { TrendingUp, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export function PlacementScore() {
    const user = useAuthStore((state) => state.user);

    const { data: scoreData, isLoading } = useQuery({
        queryKey: ["readiness-score", user?.id],
        queryFn: () => api.readiness.getScore(user?.id!).then(res => res.data),
        enabled: !!user?.id,
    });

    const score = scoreData?.currentScore || 0;
    const history = JSON.parse(scoreData?.history || '[]');
    const previousScore = history.length > 1 ? history[history.length - 2].score : score;
    const diff = score - previousScore;

    const circumference = 2 * Math.PI * 45; // radius 45
    const strokeDashoffset = circumference - (score / 100) * circumference;

    if (isLoading) return (
        <div className="glass-card p-6 rounded-2xl flex items-center justify-center min-h-[300px]">
            <Loader2 className="animate-spin text-primary" />
        </div>
    );

    return (
        <div className="relative group col-span-1 md:col-span-2 lg:col-span-1 glass-card p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] overflow-hidden border border-white/5">

            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <div className={`h-2 w-2 ${score > 70 ? 'bg-green-500' : 'bg-yellow-500'} rounded-full animate-pulse shadow-[0_0_10px_currentColor]`} />
            </div>

            <h3 className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] mb-4 z-10">Placement Probability</h3>

            <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Glow behind */}
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-0 group-hover:scale-110 transition-transform duration-700" />

                <svg className="w-full h-full -rotate-90 transform drop-shadow-[0_0_10px_rgba(var(--primary),0.3)]">
                    <circle
                        cx="50%"
                        cy="50%"
                        r="45"
                        fill="transparent"
                        stroke="hsl(var(--muted))"
                        strokeWidth="8"
                        className="opacity-20"
                    />
                    <motion.circle
                        cx="50%"
                        cy="50%"
                        r="45"
                        fill="transparent"
                        stroke="hsl(var(--primary))"
                        strokeWidth="8"
                        strokeLinecap="round"
                        initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="drop-shadow-[0_0_8px_hsl(var(--primary))]"
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        className="text-5xl font-black text-white tracking-tighter"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {Math.round(score)}%
                    </motion.span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-50">AI Calculated</span>
                </div>
            </div>

            <div className={`mt-6 flex items-center gap-2 ${diff >= 0 ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-red-400 bg-red-400/10 border-red-400/20'} px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border`}>
                <TrendingUp className={`h-3 w-3 ${diff < 0 ? 'rotate-180' : ''}`} />
                <span>{diff >= 0 ? '+' : ''}{Math.round(diff)}% vs last session</span>
            </div>
        </div>
    );
}
