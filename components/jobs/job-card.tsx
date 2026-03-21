"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, ChevronDown, Heart, MapPin, DollarSign, Briefcase, Loader2, CheckCircle, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Job } from "@/lib/api-types";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MatchScoreGauge } from "./match-gauge";
import { SmartApplyModal } from "./smart-apply-modal";

export function JobCard({ job, initialStatus = "SAVED" }: { job: Job, initialStatus?: string }) {
    const user = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();
    const router = useRouter();
    const [expanded, setExpanded] = useState(false);
    const [status, setStatus] = useState(initialStatus);
    const [showApplyModal, setShowApplyModal] = useState(false);

    const matchScore = Math.round(job.matchScore || 0);

    // Mutations
    const updateStatusMutation = useMutation({
        mutationFn: (newStatus: string) =>
            api.applications.updateStatus({ userId: user?.id!, jobId: job.id, status: newStatus }),
        onSuccess: (res) => {
            setStatus(res.data.status);
            queryClient.invalidateQueries({ queryKey: ["app-stats", user?.id] });
            queryClient.invalidateQueries({ queryKey: ["my-applications", user?.id] });
        },
        onError: () => {
            toast.error("Failed to update status");
        }
    });

    const handleApplyClick = () => {
        if (status === "APPLIED") return;
        setShowApplyModal(true);
    };

    const handleSave = () => {
        const next = status === "SAVED" ? "UNSAVED" : "SAVED";
        updateStatusMutation.mutate("SAVED");
    };

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card rounded-2xl border border-white/5 hover:border-primary/20 transition-all duration-300 group relative overflow-hidden"
            >
                <div className="p-6">
                    {/* ... (Keep existing layout) ... */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                                <Building2 className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{job.title}</h3>
                                <p className="text-muted-foreground text-sm flex items-center gap-2">
                                    {job.company}
                                    <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                                </p>
                            </div>
                        </div>

                        <div className="shrink-0 flex items-center">
                            <MatchScoreGauge
                                score={Math.round(job.matchScore || 0)}
                                breakdown={job.matchBreakdown ? {
                                    ai: Math.round(job.matchBreakdown.ai),
                                    skills: Math.round(job.matchBreakdown.skills),
                                    recency: Math.round(job.matchBreakdown.recency),
                                    completeness: 0
                                } : undefined}
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {Array.isArray(job.requirements) ? job.requirements.slice(0, 3).map((req) => (
                            <Badge key={req} variant="secondary" className="bg-white/5 text-muted-foreground border-white/5">
                                {req}
                            </Badge>
                        )) : typeof job.requirements === 'string' ? (
                            JSON.parse(job.requirements as string).slice(0, 3).map((req: string) => (
                                <Badge key={req} variant="secondary" className="bg-white/5 text-muted-foreground border-white/5">
                                    {req}
                                </Badge>
                            ))
                        ) : (
                            <Badge variant="secondary" className="bg-white/5 text-muted-foreground border-white/5">
                                Skill Match
                            </Badge>
                        )}
                    </div>

                    <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.type || 'Full-time'}</span>
                            <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> {job.salary || 'Market Rate'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleSave}
                                disabled={updateStatusMutation.isPending}
                                className={cn("hover:bg-pink-500/10 hover:text-pink-500 transition-colors", status === "SAVED" && "text-pink-500 bg-pink-500/10")}
                            >
                                <Heart className={cn("h-4 w-4 transition-transform", status === "SAVED" && "fill-current scale-110")} />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setExpanded(!expanded)}
                                className="gap-2 border-primary/20"
                            >
                                Details
                                <ChevronDown className={cn("h-3 w-3 transition-transform", expanded && "rotate-180")} />
                            </Button>

                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => router.push(`/interview?jobId=${job.id}&jobTitle=${encodeURIComponent(job.title)}`)}
                                className="gap-2 bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20"
                            >
                                <Video className="h-3 w-3" />
                                Practice
                            </Button>

                            <Button
                                size="sm"
                                onClick={handleApplyClick}
                                disabled={status === "APPLIED" || updateStatusMutation.isPending}
                                className={cn(
                                    "min-w-[100px]",
                                    status === "APPLIED" ? "bg-green-500/20 text-green-500 hover:bg-green-500/20" : "bg-primary hover:bg-primary/90"
                                )}
                            >
                                {updateStatusMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : status === "APPLIED" ? (
                                    <><CheckCircle className="h-3 w-3 mr-1" /> Applied</>
                                ) : (
                                    "Apply Now"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/5 bg-white/[0.02]"
                        >
                            <div className="p-6 space-y-4">
                                {job.explanation && (
                                    <div className="glass-panel p-4 rounded-xl border-primary/20 bg-primary/5 space-y-3 mb-4">
                                        <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">AI Strategic Advice</h5>
                                        <p className="text-xs text-white/90 leading-relaxed italic">
                                            "{job.explanation?.whyThisMatches || 'Our AI sees a strong match between your resume vectors and this role requirements.'}"
                                        </p>

                                        {job.explanation?.missingSkills?.length > 0 && (
                                            <div className="pt-2">
                                                <p className="text-[9px] text-muted-foreground uppercase font-bold mb-2">Suggested Skill Upgrade</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {job.explanation.missingSkills.map((skill: string) => (
                                                        <Badge key={skill} variant="outline" className="text-[9px] py-0 border-primary/10 bg-primary/5 text-primary/70">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-white text-sm">Description</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {job.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <SmartApplyModal
                job={job}
                isOpen={showApplyModal}
                onClose={() => {
                    setShowApplyModal(false);
                    // Optimistic update if needed or refetch
                    queryClient.invalidateQueries({ queryKey: ["all-jobs"] });
                }}
            />
        </>
    );
}
