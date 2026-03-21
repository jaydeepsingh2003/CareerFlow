"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Brain, Sparkles, Rocket, Zap, Clock, 
    ArrowRight, Target, Layout, Shield, 
    Database, Activity, TrendingUp, Info,
    Bot, BrainCircuit, Globe, Server, Cpu, 
    BarChart3, Layers, Fingerprint, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store";
import { useAICareerStore } from "@/lib/ai-career-store";
import { cn } from "@/lib/utils";
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, TooltipProps 
} from "recharts";
import axios from "axios";

export default function IntelligentHub() {
    const { user } = useAuthStore();
    const { userSkills, matchedJobs, appliedJobs, syncWithBackend } = useAICareerStore();
    const [systemStats, setSystemStats] = useState<any>(null);
    const [activityData, setActivityData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (user?.id) {
                await syncWithBackend(user.id);
                try {
                    const [statsRes, activityRes] = await Promise.all([
                        axios.get('http://localhost:3001/analytics/system-stats'),
                        axios.get(`http://localhost:3001/analytics/user-activity/${user.id}`)
                    ]);
                    setSystemStats(statsRes.data);
                    
                    // Format dates for the graph
                    const formattedActivity = activityRes.data.map((item: any) => ({
                        ...item,
                        displayDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    }));
                    setActivityData(formattedActivity);
                } catch (err) {
                    console.error("Failed to fetch dashboard data", err);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchData();
    }, [user?.id, syncWithBackend]);

    const stats = [
        {
            label: "Verified Skills",
            value: userSkills.length,
            icon: BrainCircuit,
            color: "text-primary",
            bg: "bg-primary/10",
            desc: "Active vectors in matrix"
        },
        {
            label: "Job Alignments",
            value: matchedJobs.length,
            icon: Target,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            desc: "Matched opportunities"
        },
        {
            label: "Applied Tracks",
            value: appliedJobs.length,
            icon: Rocket,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            desc: "Verified applications"
        },
        {
            label: "Global Conversion",
            value: systemStats?.conversionRate ? `${systemStats.conversionRate.toFixed(1)}%` : "12.4%",
            icon: TrendingUp,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            desc: "Candidate success rate"
        }
    ];

    return (
        <div className="min-h-screen space-y-12 pb-24 relative overflow-hidden px-4 md:px-8 pt-8">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] -z-10 rounded-full animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] -z-10 rounded-full" />

            {/* Matrix Header */}
            <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
                <div className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10"
                    >
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Neural Node: 0x7E4...Active</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic leading-[0.9]"
                    >
                        Intelligence <span className="text-primary not-italic">Hub</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-neutral-500 font-medium max-w-xl text-sm leading-relaxed"
                    >
                        Real-time synchronization of your cognitive profile with global job registries and deterministic simulation engines.
                    </motion.p>
                </div>

                <div className="flex gap-4">
                    <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center gap-4 group hover:bg-white/[0.04] transition-all">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Fingerprint className="w-5 h-5" />
                        </div>
                        <div className="pr-4">
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Active Identity</p>
                            <p className="text-sm font-bold text-white uppercase italic">{user?.firstName || 'Operator'}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Real-time Data Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] blur-2xl group-hover:bg-primary/5 transition-all" />
                        <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-6", stat.bg)}>
                            <stat.icon className={cn("w-6 h-6", stat.color)} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">{stat.label}</p>
                            <p className="text-3xl font-black text-white tracking-tighter">{isLoading ? "---" : stat.value}</p>
                            <p className="text-[11px] font-bold text-neutral-600 italic">"{stat.desc}"</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Core Operation Matrix */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
                
                {/* Activity Matrix (Top Span) */}
                <div className="lg:col-span-12">
                    <Card className="rounded-[3rem] bg-white/[0.02] border-white/5 p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Activity className="w-12 h-12 text-primary" />
                        </div>
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                                    <Zap className="w-6 h-6 text-primary" />
                                    Neural Activity Trace
                                </h2>
                                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mt-1">Real-time interaction telemetry</p>
                            </div>
                            <div className="flex gap-2">
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black italic">
                                    {activityData.reduce((acc, curr) => acc + curr.count, 0)} TOTAL ACTIONS
                                </Badge>
                                <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 text-[10px] font-black italic">
                                    SYNCED
                                </Badge>
                            </div>
                        </div>

                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={activityData}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                                            <stop offset="50%" stopColor="var(--primary)" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                                        </linearGradient>
                                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur stdDeviation="6" result="blur" />
                                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                        </filter>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis 
                                        dataKey="displayDate" 
                                        stroke="#444" 
                                        fontSize={10} 
                                        fontWeight="900"
                                        tickLine={false}
                                        axisLine={false}
                                        dy={15}
                                        className="uppercase tracking-widest font-mono"
                                    />
                                    <YAxis 
                                        stroke="#444" 
                                        fontSize={10} 
                                        fontWeight="900"
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                        className="font-mono"
                                    />
                                    <Tooltip 
                                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-[#050505]/95 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] border-t-primary/30">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{payload[0].payload.displayDate}</p>
                                                        </div>
                                                        <p className="text-4xl font-black text-white tracking-tighter tabular-nums">{payload[0].value}</p>
                                                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mt-1 italic">Interactions Verified</p>
                                                        
                                                        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-[8px] font-black text-neutral-600 uppercase">Latency</p>
                                                                <p className="text-[10px] font-bold text-emerald-500">0.4ms</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[8px] font-black text-neutral-600 uppercase">Integrity</p>
                                                                <p className="text-[10px] font-bold text-primary italic">99.9%</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="count" 
                                        stroke="var(--primary)" 
                                        strokeWidth={4}
                                        fillOpacity={1} 
                                        fill="url(#colorCount)" 
                                        animationDuration={2500}
                                        animationEasing="ease-in-out"
                                        style={{ filter: 'url(#glow)' }}
                                        activeDot={{ 
                                            r: 8, 
                                            stroke: 'white', 
                                            strokeWidth: 2, 
                                            fill: 'var(--primary)',
                                            className: "animate-pulse"
                                        }}
                                        dot={(props: any) => {
                                            const { cx, cy, value } = props;
                                            if (value === 0) return null;
                                            return (
                                                <svg key={`dot-${cx}-${cy}`} x={cx - 4} y={cy - 4} width={8} height={8} className="text-primary overflow-visible">
                                                    <circle cx={4} cy={4} r={4} fill="currentColor" opacity={0.5} />
                                                    <circle cx={4} cy={4} r={2} fill="white" />
                                                </svg>
                                            );
                                        }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Visual Skill Matrix (Left) */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="rounded-[3rem] bg-white/[0.02] border-white/5 p-8 relative overflow-hidden h-full flex flex-col">
                        <div className="absolute top-0 right-0 p-8">
                            <BarChart3 className="w-12 h-12 text-white/5" />
                        </div>

                        <div>
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3 mb-8">
                                <Database className="w-6 h-6 text-primary" />
                                Your Skill Matrix
                            </h2>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {userSkills.length > 0 ? userSkills.slice(0, 6).map((skill: any, i) => (
                                    <div key={i} className="p-5 rounded-3xl bg-black/40 border border-white/5 hover:border-primary/30 transition-all group">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{skill.name}</span>
                                            <span className="text-xs font-black text-primary italic">{(skill.finalScore * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${skill.finalScore * 100}%` }}
                                                className="h-full bg-primary"
                                            />
                                        </div>
                                    </div>
                                )) : (
                                    [1,2,3,4,5,6].map(i => (
                                        <div key={i} className="p-5 rounded-3xl bg-white/[0.01] border border-dashed border-white/10 animate-pulse h-24" />
                                    ))
                                )}
                            </div>
                        </div>

                        {appliedJobs.length > 0 && (
                            <div className="mt-12 space-y-6">
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] flex items-center gap-4">
                                    History Registry <div className="h-px w-20 bg-white/10" />
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {appliedJobs.slice(0, 4).map((app: any) => (
                                        <div key={app.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                                    <Briefcase className="w-4 h-4" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-[11px] font-black text-white uppercase italic truncate">{app.job?.title || 'Job Trace'}</p>
                                                    <p className="text-[9px] font-bold text-neutral-600 truncate">{app.job?.company || 'Nexus'}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-[8px] bg-indigo-500/5 text-indigo-400 border-indigo-500/20">
                                                {app.status}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mt-auto flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-white/5">
                            <p className="text-xs text-neutral-500 font-medium italic">
                                * Cognitive evaluation reflects verified competencies across {userSkills.length} technical domains.
                            </p>
                            <Button
                                onClick={() => window.location.href = '/settings'}
                                className="rounded-2xl h-12 px-8 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-neutral-200"
                            >
                                View Full Profile
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Registry Live Feed (Right) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="p-8 rounded-[3.5rem] bg-gradient-to-b from-primary/10 to-transparent border border-primary/20 h-full flex flex-col">
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3 mb-8">
                            <Server className="w-5 h-5 text-primary" />
                            Registry Node
                        </h2>

                        <div className="flex-1 space-y-6">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Active Jobs Matched</p>
                                <div className="space-y-3">
                                    {matchedJobs.slice(0, 3).map((job: any, i) => (
                                        <div key={i} className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-primary/20 transition-all cursor-pointer" onClick={() => window.location.href = `/jobs/${job.id}`}>
                                            <p className="text-xs font-black text-white uppercase italic truncate">{job.title}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-[9px] font-bold text-neutral-500">{job.company}</span>
                                                <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[8px] font-black">{Math.round((job.score || 0.8) * 100)}% MATCH</Badge>
                                            </div>
                                        </div>
                                    ))}
                                    {matchedJobs.length === 0 && (
                                        <div className="p-4 rounded-2xl bg-white/5 border border-dashed border-white/10 text-center py-12">
                                            <Target className="w-8 h-8 text-neutral-700 mx-auto mb-2" />
                                            <p className="text-[10px] font-black text-neutral-500 uppercase">Scanning Registry...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button 
                            onClick={() => window.location.href = '/job-alignment'}
                            className="w-full mt-8 h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest italic"
                        >
                            Sync Alignment Matrix
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bottom Status Protocol */}
            <div className="max-w-7xl mx-auto flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-full px-8">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">LLAMA 3.3 CORE: READY</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">DATA SYNC: REALTIME</span>
                    </div>
                </div>
                <div className="hidden md:block">
                    <span className="text-[10px] font-black text-neutral-600 italic">SYSTEM VERSION: 4.0.2-ALPHA</span>
                </div>
            </div>
        </div>
    );
}
