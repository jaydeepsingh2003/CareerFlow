"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { JobCard } from "./job-card";
import { Loader2, Kanban, LayoutList, Inbox } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

import { StatusBoard } from "./status-board";

export function ApplicationList() {
    const user = useAuthStore((state) => state.user);
    const [view, setView] = useState<"list" | "status">("list");

    const { data: apps, isLoading } = useQuery({
        queryKey: ["my-applications", user?.id],
        queryFn: () => api.applications.getMy(user?.id!).then(res => res.data),
        enabled: !!user?.id,
    });

    if (isLoading) return <div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-primary" /></div>;

    if (!apps || apps.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 glass-card rounded-2xl border-dashed border-white/10 opacity-50">
                <Inbox className="h-12 w-12 mb-4 text-muted-foreground" />
                <h3 className="text-xl font-bold text-white">No applications yet</h3>
                <p className="text-muted-foreground">Apply to some jobs to start tracking your progress!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-wider text-[10px] text-primary">Active Pipeline</h2>
                    <p className="text-xs text-muted-foreground">Tracking {apps.length} job applications</p>
                </div>

                <Tabs value={view} onValueChange={(v: any) => setView(v)}>
                    <TabsList className="bg-white/5 border border-white/5">
                        <TabsTrigger value="list" className="gap-2"><LayoutList className="h-4 w-4" /> List</TabsTrigger>
                        <TabsTrigger value="status" className="gap-2"><Kanban className="h-4 w-4" /> Board</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {view === "list" ? (
                <div className="grid gap-4">
                    {apps.map((app: any, i: number) => (
                        <motion.div
                            key={app.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <JobCard
                                job={{
                                    ...app.job,
                                    matchScore: app.score
                                }}
                                initialStatus={app.status}
                            />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <StatusBoard applications={apps} />
            )}
        </div>
    );
}
