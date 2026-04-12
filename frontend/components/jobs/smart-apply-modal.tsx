"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink, AlertTriangle, Lightbulb } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface SmartApplyModalProps {
    job: any; // Using any for simplicity in this snippet, ideally strict type
    isOpen: boolean;
    onClose: () => void;
}

export function SmartApplyModal({ job, isOpen, onClose }: SmartApplyModalProps) {
    const user = useAuthStore((state) => state.user);
    const [loading, setLoading] = useState(false);

    const handleApply = async () => {
        setLoading(true);
        try {
            // Track application
            await api.jobs.apply(job.id, user?.id!);

            toast.success("Application tracked! Redirecting...");

            // Redirect after short delay
            setTimeout(() => {
                window.open(job.applyUrl || job.originalUrl, "_blank");
                onClose();
            }, 1000);

        } catch (error) {
            toast.error("Failed to track application.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        AI Pre-Apply Insights
                    </DialogTitle>
                    <DialogDescription>
                        Before you apply to <span className="font-bold text-white">{job.company}</span>, here are some tips to boost your chances.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Resume Match Score (Mocked for now or use passed prop) */}
                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground">Compatibility Score</h4>
                            <p className={cn("text-2xl font-bold",
                                job.matchScore > 80 ? "text-green-400" :
                                    job.matchScore > 50 ? "text-yellow-400" : "text-red-400"
                            )}>
                                {job.matchScore}%
                            </p>
                        </div>
                        <Badge variant="outline" className={cn(
                            job.matchScore > 80 ? "text-green-400 border-green-400/20 bg-green-400/10" :
                                job.matchScore > 50 ? "text-yellow-400 border-yellow-400/20 bg-yellow-400/10" : "text-red-400 border-red-400/20 bg-red-400/10"
                        )}>
                            {job.matchScore > 80 ? "Strong Match" : job.matchScore > 50 ? "Fair Match" : "Low Match"}
                        </Badge>
                    </div>

                    {job.explanation?.missingSkills?.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium text-white flex items-center gap-2">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                                Add to your Resume
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {job.explanation.missingSkills.map((k: string) => (
                                    <Badge key={k} variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20">
                                        {k}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-xs text-blue-300">
                        <strong>AI Strategic Insight:</strong> {job.explanation?.whyThisMatches || "Ensure your resume highlights your core competencies relevant to this JD."}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleApply} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
                        {loading ? "Tracking..." : "Continue to Application"}
                        <ExternalLink className="h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
