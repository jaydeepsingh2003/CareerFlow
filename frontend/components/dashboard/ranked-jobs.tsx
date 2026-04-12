"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, MapPin, Building2, Briefcase, Target, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { TraceTooltip } from "@/components/career/TraceTooltip";
import Link from "next/link";

export function RankedJobs() {
    const user = useAuthStore((state) => state.user);

    const { data: jobs, isLoading } = useQuery({
        queryKey: ["ranked-jobs", user?.id],
        queryFn: () => api.jobs.getFeed(user?.id!).then(res => res.data),
        enabled: !!user?.id,
    });

    if (isLoading) return (
        <div className="glass-card p-6 rounded-2xl col-span-2 min-h-[300px] flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" />
        </div>
    );

    return (
        <div className="glass-card p-6 rounded-2xl lg:col-span-2 border border-white/10 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-primary">
                    <TrendingUp className="h-5 w-5" />
                    <h3 className="font-bold text-lg text-white">Recommended for You</h3>
                </div>
                <Link href="/jobs" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    View All Jobs
                </Link>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {jobs?.jobs?.map((job: any, i: number) => (
                    <motion.div
                        key={job.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-white/10 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-bold text-white group-hover:text-primary transition-colors">{job.title}</h4>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {job.company}</span>
                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge className={`bg-primary/20 text-primary border-primary/30 font-black tracking-tighter`}>
                                    {Math.round(job.matchScore || 0)}% MATCH
                                </Badge>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-muted-foreground uppercase font-black">Skills:</span>
                                    <div className="flex flex-wrap gap-1">
                                        {job.skills?.slice(0, 3).map((s: string) => (
                                            <Badge key={s} variant="outline" className="text-[8px] h-4 border-white/10 text-white/40">
                                                {s}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <TraceTooltip 
                                    engine="Qwen" 
                                    label="Match reasoning"
                                    reason={`Identity Engine identifies ${(job.matchScore || 0).toFixed(0)}% resonance. Strong alignment in core domain, but missing ${job.missingSkills?.length || 0} critical vectors.`}
                                >
                                    <div className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase cursor-help">
                                        <Target className="h-3 w-3" /> Trace
                                    </div>
                                </TraceTooltip>
                            </div>
                            
                            <div className="space-y-1">
                                <Progress value={job.matchScore} className="h-1 bg-white/5" indicatorClassName="bg-primary" />
                            </div>

                            {job.missingSkills?.length > 0 && (
                                <div className="flex items-center gap-2 pt-1 border-t border-white/5 uppercase font-black text-[8px]">
                                    <AlertCircle className="h-2.5 w-2.5 text-orange-400" />
                                    <span className="text-orange-400/80">Missing:</span>
                                    <span className="text-muted-foreground">{job.missingSkills.join(", ")}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {(!jobs?.jobs || jobs.jobs.length === 0) && (
                    <div className="text-center py-10">
                        <p className="text-muted-foreground text-sm">No job matches found yet. Update your profile skills to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
