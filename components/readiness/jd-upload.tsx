"use client";

import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, CheckCircle, Brain, Target, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useAuthStore, useReadinessStore } from "@/lib/store";
import { toast } from "sonner";

export function JdUpload() {
    const user = useAuthStore((state) => state.user);
    const { setPlan, isAnalyzing, setIsAnalyzing } = useReadinessStore();
    const [jdText, setJdText] = useState("");
    const [activeTab, setActiveTab] = useState<"upload" | "text">("text");

    const handleAnalyze = async () => {
        if (!jdText.trim()) {
            toast.error("Please provide a Job Description.");
            return;
        }

        setIsAnalyzing(true);
        try {
            // Step 1: Create a Job Posting dummy for analysis
            const jobRes = await api.jobs.create({
                title: "Target Role",
                company: "Dynamic",
                description: jdText,
                requirements: JSON.stringify(["React", "Node.js", "TypeScript"]), // Fallback for MVP
                status: "OPEN"
            });

            const jobId = jobRes.data.id;

            // Step 2: Generate Readiness Plan
            const planRes = await api.readiness.generate(user?.id!, jobId);
            setPlan(planRes.data);
            toast.success("AI Analysis Complete!");
        } catch (err: any) {
            toast.error("AI Analysis failed. Please try again.");
            console.error(err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden border border-white/10 group">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-indigo-400">
                    <Sparkles className="h-5 w-5 animate-pulse" />
                    <h3 className="font-bold text-lg text-white">AI JD Analyzer</h3>
                </div>
            </div>

            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    Paste the target Job Description below. Our AI will analyze the requirements and create a personalized preparation plan for you.
                </p>

                <div className="relative group">
                    <Textarea
                        placeholder="Paste Job Description here..."
                        className="min-h-[200px] bg-white/5 border-white/10 focus:border-primary/50 text-sm transition-all resize-none"
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        disabled={isAnalyzing}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none opacity-50" />
                </div>

                <Button
                    onClick={handleAnalyze}
                    className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-6 rounded-xl shadow-lg shadow-indigo-500/20 group overflow-hidden relative"
                    disabled={isAnalyzing}
                >
                    {isAnalyzing ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            AI is Analyzing your fit...
                        </>
                    ) : (
                        <>
                            <Brain className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                            Generate Readiness Plan
                        </>
                    )}

                    {/* Animated shine */}
                    <motion.div
                        initial={{ x: "-100%" }}
                        animate={isAnalyzing ? { x: "200%" } : { x: "-100%" }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-white/10 skew-x-12"
                    />
                </Button>
            </div>

            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
        </div>
    );
}
