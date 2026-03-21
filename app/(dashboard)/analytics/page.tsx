"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { AnalyticsCharts } from "@/components/analytics/charts";
import { Stats } from "@/components/dashboard/stats";
import { TrendingUp, Zap, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AnalyticsPage() {
    const user = useAuthStore((state) => state.user);

    const { data: scoreData } = useQuery({
        queryKey: ["readiness-score", user?.id],
        queryFn: () => api.readiness.getScore(user?.id!),
        enabled: !!user?.id,
    });

    const score = scoreData?.data?.currentScore || 0;

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Performance Analytics</h1>
                    <p className="text-muted-foreground">Track your professional growth and placement probability.</p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 backdrop-blur-md px-3 py-1.5 h-auto text-[10px] uppercase font-bold gap-2">
                        <Zap className="h-3.5 w-3.5" /> {score > 80 ? 'Elite Tier Candidate' : 'Emerging Talent'}
                    </Badge>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 backdrop-blur-md px-3 py-1.5 h-auto text-[10px] uppercase font-bold gap-2">
                        <TrendingUp className="h-3.5 w-3.5" /> High Potential
                    </Badge>
                </div>
            </div>

            <Stats />

            <div className="mt-8">
                <AnalyticsCharts />
            </div>
        </div>
    );
}
