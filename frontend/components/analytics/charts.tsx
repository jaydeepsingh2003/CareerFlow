"use client";

import { motion } from "framer-motion";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

export function AnalyticsCharts() {
    const user = useAuthStore((state) => state.user);

    const { data: scoreData, isLoading: scoreLoading } = useQuery({
        queryKey: ["readiness-score", user?.id],
        queryFn: () => api.readiness.getScore(user?.id!),
        enabled: !!user?.id,
    });

    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ["app-stats", user?.id],
        queryFn: () => api.applications.getStats(user?.id!),
        enabled: !!user?.id,
    });

    const { data: interviewTrends } = useQuery({
        queryKey: ["analytics-trends", user?.id],
        queryFn: () => api.analytics.getTrends(user?.id!),
        enabled: !!user?.id,
    });

    if (scoreLoading || statsLoading) return (
        <div className="flex items-center justify-center min-h-[400px] col-span-2">
            <Loader2 className="animate-spin text-primary" />
        </div>
    );

    const history = JSON.parse(scoreData?.data?.history || '[]');
    const chartHistory = history.map((h: any) => ({
        month: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: h.score
    }));

    const stats = statsData?.data || {};
    const funnelData = [
        { name: "Applied", value: stats.applied || 0, fill: "#3b82f6" },
        { name: "Interview", value: stats.interviewing || 0, fill: "#a855f7" },
        { name: "Offer", value: stats.offers || 0, fill: "#22c55e" },
        { name: "Rejected", value: stats.rejected || 0, fill: "#ef4444" },
    ].filter(d => d.value > 0);

    const conversionData = [
        { name: "Applications", value: stats.applied || 0 },
        { name: "Interviews", value: stats.interviewing || 0 },
        { name: "Offers", value: stats.offers || 0 },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Readiness Trend */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 rounded-2xl md:col-span-2 border border-white/5"
            >
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider text-[10px] text-primary">Readiness Growth Trend</h3>
                    <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded">Real-time Evolution</span>
                </div>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartHistory.length > 0 ? chartHistory : [{ month: 'Wait', score: 0 }]}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis
                                dataKey="month"
                                stroke="#ffffff20"
                                tick={{ fill: '#ffffff50', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#ffffff20"
                                tick={{ fill: '#ffffff50', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                domain={[0, 100]}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f0f13', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="score"
                                stroke="#7c3aed"
                                fillOpacity={1}
                                fill="url(#colorScore)"
                                strokeWidth={4}
                                animationDuration={2000}
                                dot={{ fill: '#7c3aed', stroke: '#fff', strokeWidth: 2, r: 4 }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Interview Performance Trend */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 rounded-2xl md:col-span-2 border border-white/5"
            >
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-white uppercase tracking-wider text-[10px] text-blue-400">Interview Scores</h3>
                    <span className="text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded">Latest Sessions</span>
                </div>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={interviewTrends?.data?.interviews || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#ffffff20"
                                tick={{ fill: '#ffffff50', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                stroke="#ffffff20"
                                tick={{ fill: '#ffffff50', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                                domain={[0, 100]}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f0f13', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }}
                                cursor={{ fill: 'white', opacity: 0.05 }}
                            />
                            <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Application Funnel */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="glass-card p-6 rounded-2xl border border-white/5"
            >
                <h3 className="text-lg font-bold text-white uppercase tracking-wider text-[10px] text-primary mb-6">Pipeline Composition</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={funnelData.length > 0 ? funnelData : [{ name: 'Empty', value: 1, fill: '#333' }]}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {funnelData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f0f13', border: '1px solid #ffffff10', borderRadius: '12px' }}
                            />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Conversion Rate */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="glass-card p-6 rounded-2xl border border-white/5"
            >
                <h3 className="text-lg font-bold text-white uppercase tracking-wider text-[10px] text-primary mb-6">Success Metrics</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={conversionData} layout="vertical" barSize={12}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#ffffff05" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                stroke="#ffffff30"
                                width={100}
                                tick={{ fill: '#ffffff50', fontSize: 10, fontWeight: 'bold' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#0f0f13', border: '1px solid #ffffff10', borderRadius: '12px' }} />
                            <Bar dataKey="value" fill="#7c3aed" radius={[0, 10, 10, 0]}>
                                {conversionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 2 ? '#22c55e' : '#7c3aed'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

        </div>
    );
}
