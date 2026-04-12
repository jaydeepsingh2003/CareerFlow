
"use client";

import { JdUpload } from "@/components/readiness/jd-upload";
import { ReadinessChecklist } from "@/components/readiness/checklist";
import { GapAnalysis } from "@/components/readiness/gap-analysis";
import { ReadinessChart } from "@/components/dashboard/readiness-chart";
import { motion } from "framer-motion";
import { Target, Trophy } from "lucide-react";

export default function ReadinessPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Placement Readiness</h1>
                    <p className="text-muted-foreground">Comprehensive analysis and improvement plan.</p>
                </div>
                <div className="flex items-center gap-2 p-2 px-4 rounded-full bg-primary/10 border border-primary/20">
                    <Trophy className="h-5 w-5 text-yellow-400" />
                    <span className="font-bold text-primary">Rank #42</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - JD Upload & Checklist */}
                <div className="space-y-6 lg:col-span-2">
                    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                        <JdUpload />
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <GapAnalysis />
                    </motion.div>
                </div>

                {/* Right Column - Chart & Summary */}
                <div className="space-y-6 lg:col-span-1">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <ReadinessChart />
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="h-full"
                    >
                        <ReadinessChecklist />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
