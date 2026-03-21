"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Loader2, TrendingUp, Globe, Users } from "lucide-react";

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export function MarketInsights() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ["system-stats"],
        queryFn: () => api.analytics.getSystemStats().then(res => res.data),
    });

    if (isLoading) return <div className="flex items-center justify-center p-10"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass-card p-4 border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                            <TrendingUp size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Conversion Rate</p>
                            <h3 className="text-lg font-bold text-white">{stats?.conversionRate?.toFixed(1)}%</h3>
                        </div>
                    </div>
                </Card>
                <Card className="glass-card p-4 border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                            <Globe size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Global Source Map</p>
                            <h3 className="text-lg font-bold text-white">{stats?.jobsPerSource?.length} API Nodes</h3>
                        </div>
                    </div>
                </Card>
                <Card className="glass-card p-4 border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                            <Users size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Interactions</p>
                            <h3 className="text-lg font-bold text-white">{stats?.totalEvents} Events</h3>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="glass-card p-6 border-white/5 bg-white/[0.02]">
                <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Market Distribution by Source
                </h3>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats?.jobsPerSource}>
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#666', fontSize: 10 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                {stats?.jobsPerSource?.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
}
