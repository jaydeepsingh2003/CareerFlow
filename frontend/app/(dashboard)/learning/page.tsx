"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, BookOpen, ExternalLink, GraduationCap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export default function LearningPage() {
    const user = useAuthStore((state) => state.user);

    const { data: readinessData, isLoading } = useQuery({
        queryKey: ["readiness-score", user?.id],
        queryFn: () => api.readiness.getScore(user?.id!).then(res => res.data),
        enabled: !!user?.id,
    });

    const { data: readinessPlan, isLoading: isLoadingPlan } = useQuery({
        queryKey: ["readiness-plan", user?.id],
        queryFn: () => api.readiness.getPlan(user?.id!).then(res => res.data),
        enabled: !!user?.id,
    });

    const tasks = readinessPlan?.tasks || [];

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <GraduationCap className="h-8 w-8 text-purple-400" />
                    Personalized Learning Path
                </h1>
                <p className="text-muted-foreground mt-2">
                    AI-curated curriculum to close your technical gaps and land your target role.
                </p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card p-6 border-purple-500/20 bg-purple-500/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-purple-200 font-semibold">Readiness Score</h3>
                        <Badge variant="outline" className="bg-purple-500/20 text-purple-200 border-purple-500/30">Target: 90%</Badge>
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-5xl font-bold text-white">{Math.round(readinessData?.currentScore || 0)}%</span>
                        <span className="text-sm text-muted-foreground mb-2">current match</span>
                    </div>
                    <Progress value={readinessData?.currentScore || 0} className="mt-4 h-2 bg-purple-950" />
                </Card>

                <Card className="glass-card p-6 border-blue-500/20 bg-blue-500/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-blue-200 font-semibold">Active Modules</h3>
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-5xl font-bold text-white">{tasks.filter(t => !t.isCompleted).length}</span>
                        <span className="text-sm text-muted-foreground mb-2">tasks remaining</span>
                    </div>
                </Card>

                <Card className="glass-card p-6 border-green-500/20 bg-green-500/5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-green-200 font-semibold">Completed</h3>
                    </div>
                    <div className="flex items-end gap-3">
                        <span className="text-5xl font-bold text-white">{tasks.filter(t => t.isCompleted).length}</span>
                        <span className="text-sm text-muted-foreground mb-2">modules mastered</span>
                    </div>
                </Card>
            </div>

            {/* Learning Modules */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white">Recommended Modules</h2>
                {tasks.length === 0 ? (
                    <div className="text-center py-10 glass-card border-white/5 bg-white/5 rounded-xl">
                        <p className="text-muted-foreground">No active learning plan found. Browse jobs to generate a personalized learning plan!</p>
                        <Button className="mt-4" onClick={() => window.location.href = '/jobs'}>Browse Jobs</Button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {tasks.map((task) => {
                            let resources = [];
                            try { resources = JSON.parse(task.resources as any || '[]'); } catch (e) { }

                            return (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="group glass-card p-6 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all bg-[#0a0a0f]"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-4">
                                            <div className={`mt-1 p-2 rounded-lg ${task.isCompleted ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-muted-foreground'}`}>
                                                {task.isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                                                    {task.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    {task.description}
                                                </p>
                                                <div className="flex gap-2">
                                                    {resources.map((res: string, idx: number) => (
                                                        <Badge key={idx} variant="secondary" className="bg-white/5 hover:bg-white/10 text-xs">
                                                            <BookOpen className="w-3 h-3 mr-1" /> {res}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="border-white/10 hover:bg-white/5 text-white">
                                            {task.isCompleted ? 'Review' : 'Start'} <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
