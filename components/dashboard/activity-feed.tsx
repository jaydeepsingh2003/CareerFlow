"use client";

import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Zap, Briefcase, FileText, Target, Brain, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";

const getIcon = (type: string) => {
    switch (type.toUpperCase()) {
        case 'APPLY': return <Briefcase className="h-3.5 w-3.5" />;
        case 'RESUME_SCORE': return <FileText className="h-3.5 w-3.5" />;
        case 'MATCH_CALC': return <Target className="h-3.5 w-3.5" />;
        case 'INTERVIEW_START': return <Brain className="h-3.5 w-3.5" />;
        default: return <Zap className="h-3.5 w-3.5" />;
    }
};

const getColor = (type: string) => {
    switch (type.toUpperCase()) {
        case 'APPLY': return 'bg-blue-500/10 text-blue-500';
        case 'RESUME_SCORE': return 'bg-green-500/10 text-green-500';
        case 'MATCH_CALC': return 'bg-orange-500/10 text-orange-500';
        case 'INTERVIEW_START': return 'bg-purple-500/10 text-purple-500';
        default: return 'bg-primary/10 text-primary';
    }
};

export function ActivityFeed() {
    const user = useAuthStore((state) => state.user);

    const { data: logs, isLoading } = useQuery({
        queryKey: ["activity-logs", user?.id],
        queryFn: () => api.events.getLogs(user?.id!).then(res => res.data),
        enabled: !!user?.id,
        refetchInterval: 60000,
    });

    if (isLoading) return (
        <div className="glass-card p-6 rounded-2xl flex items-center justify-center min-h-[400px]">
            <Loader2 className="animate-spin text-primary" />
        </div>
    );

    const activityLogs = logs || [];

    return (
        <div className="glass-card p-6 rounded-2xl col-span-1 border border-white/5 relative overflow-hidden h-full">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500 fill-yellow-500/10" />
                    <h3 className="font-bold text-lg text-white">Live Activity</h3>
                </div>
                <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground/50">Pulse Monitor</span>
            </div>

            <div className="space-y-6 relative z-10">
                {activityLogs.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-sm text-muted-foreground italic">No recent activity found.</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-2">Start exploring jobs to see your feed come alive.</p>
                    </div>
                ) : (
                    activityLogs.slice(0, 6).map((log: any, i: number) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-start gap-4 group"
                        >
                            <div className={cn(
                                "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-lg",
                                getColor(log.type)
                            )}>
                                {getIcon(log.type)}
                            </div>
                            <div className="space-y-1 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs font-bold text-white group-hover:text-primary transition-colors">
                                        {log.type.replace(/_/g, ' ')}
                                    </p>
                                    <span className="text-[10px] text-muted-foreground">
                                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-1">
                                    {log.metadata ? JSON.parse(log.metadata).message || 'Activity completed successfully.' : 'No details available.'}
                                </p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
        </div>
    );
}

import { cn } from "@/lib/utils";
