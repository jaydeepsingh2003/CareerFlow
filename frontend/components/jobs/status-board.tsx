"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { JobCard } from "./job-card";
import { ScrollArea } from "@/components/ui/scroll-area";

const STATUSES = ["SAVED", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED", "ARCHIVED"];

export function StatusBoard({ applications }: { applications: any[] }) {
    const columns = STATUSES.map(status => ({
        id: status,
        title: status.charAt(0) + status.slice(1).toLowerCase(),
        jobs: applications.filter(app => app.status === status)
    }));

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px] snap-x">
            {columns.map((column, i) => (
                <div
                    key={column.id}
                    className="w-80 shrink-0 flex flex-col gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-2xl snap-start"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${getStatusColor(column.id)}`} />
                            <h3 className="text-sm font-bold text-white uppercase tracking-tighter">{column.title}</h3>
                        </div>
                        <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px]">
                            {column.jobs.length}
                        </Badge>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="flex flex-col gap-3 pr-4">
                            {column.jobs.length === 0 ? (
                                <div className="h-24 border border-dashed border-white/5 rounded-xl flex items-center justify-center">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Empty</p>
                                </div>
                            ) : (
                                column.jobs.map((app: any) => (
                                    <motion.div
                                        key={app.id}
                                        layoutId={app.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ y: -2 }}
                                        className="glass-card p-3 rounded-xl border-white/5 bg-white/[0.03] cursor-pointer hover:bg-white/[0.05] transition-colors"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-[10px] font-bold text-primary truncate max-w-[150px]">{app.job.company}</p>
                                            <Badge className="text-[8px] h-4 leading-none bg-primary/20 text-primary border-none">
                                                {app.score}%
                                            </Badge>
                                        </div>
                                        <h4 className="text-xs font-medium text-white line-clamp-1 mb-2">{app.job.title}</h4>
                                        <div className="flex items-center justify-between text-[8px] text-muted-foreground">
                                            <span>{app.job.location}</span>
                                            <span>{new Date(app.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            ))}
        </div>
    );
}

function getStatusColor(status: string) {
    switch (status) {
        case "SAVED": return "bg-blue-400";
        case "APPLIED": return "bg-yellow-400";
        case "INTERVIEWING": return "bg-purple-400";
        case "OFFER": return "bg-green-400";
        case "REJECTED": return "bg-red-400";
        default: return "bg-gray-400";
    }
}
