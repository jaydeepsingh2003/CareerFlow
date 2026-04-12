"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Briefcase, CheckCircle2, FileText, Target, Users, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export function Stats() {
    const user = useAuthStore((state) => state.user);

    const { data: stats, isLoading } = useQuery({
        queryKey: ["app-stats", user?.id],
        queryFn: () => api.applications.getStats(user?.id!).then(res => res.data),
        enabled: !!user?.id,
    });

    if (isLoading) return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="glass-card p-6 rounded-2xl h-32 animate-pulse bg-white/5" />
            ))}
        </div>
    );

    const items = [
        {
            label: "Total Applications",
            value: stats?.applied || "0",
            change: "Across all jobs",
            icon: Briefcase,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
        },
        {
            label: "Interviews",
            value: stats?.interviewing || "0",
            change: "Next phase",
            icon: Users,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
        },
        {
            label: "Offers Received",
            value: stats?.offers || "0",
            change: "Success rate",
            icon: CheckCircle2,
            color: "text-green-500",
            bg: "bg-green-500/10",
            border: "border-green-500/20",
        },
        {
            label: "Total Pipeline",
            value: stats?.total || "0",
            change: "Full history",
            icon: Target,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {items.map((item, index) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                        "glass-card p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 border border-white/5",
                        item.border
                    )}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={cn("p-2 rounded-lg", item.bg, item.color)}>
                            <item.icon className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className={cn("glass-panel border-0 text-[10px] uppercase font-bold", item.color)}>
                            {item.change}
                        </Badge>
                    </div>

                    <div className="relative z-10">
                        <h4 className="text-3xl font-bold tracking-tight text-white mb-1 group-hover:scale-105 transition-transform origin-left">
                            {item.value}
                        </h4>
                        <p className="text-sm text-muted-foreground font-medium">{item.label}</p>
                    </div>

                    <div className={cn("absolute -bottom-4 -right-4 h-24 w-24 rounded-full blur-2xl opacity-10 group-hover:opacity-20 transition-opacity", item.bg)} />
                </motion.div>
            ))}
        </div>
    );
}