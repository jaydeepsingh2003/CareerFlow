
"use client";

import { motion } from "framer-motion";
import { TrendingUp, Award, Code, Monitor } from "lucide-react";

export function ReadinessChart() {
    const categories = [
        { label: "Aptitude", score: 85, color: "bg-blue-500", icon: Award },
        { label: "Technical", score: 65, color: "bg-purple-500", icon: Monitor },
        { label: "Coding", score: 92, color: "bg-green-500", icon: Code },
        { label: "Soft Skills", score: 78, color: "bg-pink-500", icon: TrendingUp },
    ];

    return (
        <div className="glass-card p-6 rounded-2xl col-span-1 lg:col-span-1">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-white">Readiness Breakdown</h3>
                <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded">Last 7 Days</span>
            </div>

            <div className="space-y-6">
                {categories.map((cat, index) => (
                    <div key={cat.label} className="group cursor-default">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2 group-hover:text-white transition-colors">
                                <cat.icon className="h-4 w-4" />
                                {cat.label}
                            </span>
                            <span className="text-sm font-bold text-white tabular-nums group-hover:scale-110 transition-transform">{cat.score}%</span>
                        </div>
                        <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden shadow-inner">
                            <motion.div
                                className={`h-full ${cat.color} relative overflow-hidden`}
                                initial={{ width: 0 }}
                                animate={{ width: `${cat.score}%` }}
                                transition={{ duration: 1, delay: index * 0.2 }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                            </motion.div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Overall Readiness</span>
                    <span className="text-lg font-bold text-white glow-text">High Potential</span>
                </div>
            </div>
        </div>
    );
}
