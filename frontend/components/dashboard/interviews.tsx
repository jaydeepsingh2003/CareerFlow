"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Video, Loader2, Inbox } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export function Interviews() {
    const user = useAuthStore((state) => state.user);

    const { data: apps, isLoading } = useQuery({
        queryKey: ["my-applications", user?.id],
        queryFn: () => api.applications.getMy(user?.id!).then(res => res.data),
        enabled: !!user?.id,
    });

    const interviews = apps?.filter((app: any) => app.status === 'INTERVIEWING') || [];

    if (isLoading) return (
        <div className="glass-card p-6 rounded-2xl h-[400px] flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" />
        </div>
    );

    return (
        <div className="glass-card p-6 rounded-2xl col-span-1 lg:col-span-2 relative overflow-hidden group border border-white/5">
            <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Scheduled Rounds
                </h3>
                <Button variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-white">Full Schedule</Button>
            </div>

            <div className="space-y-6 relative z-10 min-h-[100px]">
                {interviews.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-10 opacity-30">
                        <Inbox className="h-10 w-10 mb-2" />
                        <p className="text-sm font-medium">No interviews scheduled yet.</p>
                    </div>
                )}

                {interviews.map((interview: any, i: number) => (
                    <motion.div
                        key={interview.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex gap-4 group/item hover:bg-white/5 p-3 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-white/5"
                    >
                        <div className="flex flex-col items-center gap-1 min-w-[60px] pt-1">
                            <span className="text-[10px] font-black text-primary uppercase">TBD</span>
                            <span className="text-xl font-black text-white">--</span>
                        </div>

                        <div className="w-[1px] bg-white/10 relative">
                            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10" />
                        </div>

                        <div className="flex-1 pb-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h4 className="font-bold text-white group-hover/item:text-primary transition-colors">{interview.job.title}</h4>
                                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{interview.job.company} • Interview Process</p>
                                </div>
                                <Avatar className="h-8 w-8 ring-2 ring-white/5">
                                    <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">
                                        {interview.job.company[0]}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            <div className="mt-4 flex items-center gap-3">
                                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 gap-1.5 pl-2 pr-2.5 py-1 text-[10px] uppercase font-bold tracking-wider">
                                    <Video className="h-3 w-3" />
                                    Launch Virtual Board
                                </Badge>
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                                    <Clock className="h-3 w-3" />
                                    Awaiting Details
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Decorative */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
        </div>
    );
}
