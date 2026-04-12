"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, BrainCircuit, Zap, UserCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MatchScoreGaugeProps {
    score: number;
    breakdown?: {
        ai: number;
        skills: number;
        recency: number;
        completeness: number;
    };
    compact?: boolean;
}

export function MatchScoreGauge({ score, breakdown, compact = false }: MatchScoreGaugeProps) {
    const safeScore = Math.min(100, Math.max(0, parseInt(score.toString(), 10) || 0));

    // Color Logic for Score
    const getScoreColor = (value: number) => {
        if (value >= 85) return { text: "text-emerald-400", ring: "#34d399", bg: "bg-emerald-500/10" };
        if (value >= 70) return { text: "text-blue-400", ring: "#60a5fa", bg: "bg-blue-500/10" };
        if (value >= 50) return { text: "text-amber-400", ring: "#fbbf24", bg: "bg-amber-500/10" };
        return { text: "text-rose-400", ring: "#fb7185", bg: "bg-rose-500/10" };
    };

    const colors = getScoreColor(safeScore);
    const radius = compact ? 18 : 26;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (safeScore / 100) * circumference;

    return (
        <TooltipProvider>
            <div className="flex flex-col items-center gap-2">
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        <div className={cn("relative flex items-center justify-center cursor-help group", compact ? "h-10 w-10" : "h-14 w-14")}>
                            {/* Background Circle */}
                            <svg className="absolute w-full h-full -rotate-90">
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r={radius}
                                    stroke="currentColor"
                                    strokeWidth={compact ? "3" : "4"}
                                    fill="transparent"
                                    className="text-white/5"
                                />
                                {/* Progress Circle */}
                                <motion.circle
                                    cx="50%"
                                    cy="50%"
                                    r={radius}
                                    stroke={colors.ring}
                                    strokeWidth={compact ? "3" : "4"}
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    initial={{ strokeDashoffset: circumference }}
                                    animate={{ strokeDashoffset }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>

                            {/* Text */}
                            <div className="flex flex-col items-center z-10">
                                <span className={cn("font-bold", colors.text, compact ? "text-[10px]" : "text-sm")}>
                                    {safeScore}%
                                </span>
                            </div>

                            {/* Glow Effect */}
                            <div className={cn("absolute inset-0 rounded-full blur-xl opacity-20 transition-opacity group-hover:opacity-40", colors.bg)} />
                        </div>
                    </TooltipTrigger>

                    {/* Detailed Tooltip Content */}
                    <TooltipContent side="left" className="w-64 p-4 border border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                <span className="font-semibold text-white flex items-center gap-2">
                                    <Sparkles className="h-3.5 w-3.5 text-primary" /> Match Breakdown
                                </span>
                                <span className={cn("font-bold", colors.text)}>{safeScore}% Overall</span>
                            </div>

                            {breakdown && (
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground flex items-center gap-1.5"><BrainCircuit className="h-3 w-3" /> AI Semantic</span>
                                        <span className="text-white font-medium">{breakdown.ai}%</span>
                                    </div>
                                    {/* Progress Bar for AI */}
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${breakdown.ai}%` }}
                                            className="h-full bg-purple-500/80 rounded-full"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between text-xs pt-1">
                                        <span className="text-muted-foreground flex items-center gap-1.5"><Zap className="h-3 w-3" /> Skills & Tech</span>
                                        <span className="text-white font-medium">{breakdown.skills}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${breakdown.skills}%` }}
                                            className="h-full bg-blue-500/80 rounded-full"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between text-xs pt-1">
                                        <span className="text-muted-foreground flex items-center gap-1.5"><UserCheck className="h-3 w-3" /> Profile Data</span>
                                        <span className="text-white font-medium">{Math.max(breakdown.recency, breakdown.completeness)}%</span>
                                    </div>
                                </div>
                            )}

                            {!breakdown && (
                                <p className="text-xs text-muted-foreground italic">Detailed breakdown unavailable.</p>
                            )}
                        </div>
                    </TooltipContent>
                </Tooltip>

                {!compact && (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground opacity-60">
                        Match
                    </span>
                )}
            </div>
        </TooltipProvider>
    );
}
