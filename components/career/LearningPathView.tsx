"use client";

import { useAICareerStore } from "@/lib/ai-career-store";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Zap, Play, Clock, CheckCircle2, 
    ArrowRight, Youtube, Info, 
    Layers, Cpu, Sparkles, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function LearningPathView() {
    const { learningPath, rankVideos } = useAICareerStore();
    const [activeSkill, setActiveSkill] = useState<string | null>(null);
    const [videos, setVideos] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (learningPath?.steps.length && !activeSkill) {
            setActiveSkill(learningPath.steps[0].skill);
        }
    }, [learningPath]);

    useEffect(() => {
        if (activeSkill) {
            handleFetchVideos(activeSkill);
        }
    }, [activeSkill]);

    const handleFetchVideos = async (skill: string) => {
        setIsLoading(true);
        try {
            // Integration Point: YouTube Data API v3
            // In a real app, this would be a server-side call or a secure client call with key
            // For demo: Mocking Qwen-generated queries + YouTube response
            
            // Simulation of Qwen Query Generation:
            // "React fundamentals tutorial"
            // "React hooks explained beginners"
            
            const mockYoutubeResponse = [
                {
                    id: { videoId: 'w7ejDZ8SWv8' },
                    snippet: {
                        title: `Mastering ${skill}: The Advanced Guide`,
                        thumbnails: { high: { url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800' } },
                        channelTitle: 'Tech Intelligence v4',
                        publishedAt: '2024-03-10T15:00:00Z'
                    },
                    statistics: { viewCount: "120500", likeCount: "8500" }
                },
                {
                    id: { videoId: 'Ke90Tje7VS0' },
                    snippet: {
                        title: `${skill} Fundamentals & Architecture`,
                        thumbnails: { high: { url: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=800' } },
                        channelTitle: 'Architecture Pro',
                        publishedAt: '2023-11-20T10:00:00Z'
                    },
                    statistics: { viewCount: "45000", likeCount: "2100" }
                }
            ];

            const ranked = rankVideos(skill, mockYoutubeResponse);
            setVideos(ranked);
        } catch (e) {
            toast.error("Video Retrieval Error: Check Protocol Link");
        } finally {
            setIsLoading(false);
        }
    };

    if (!learningPath || learningPath.steps.length === 0) {
        return (
            <div className="glass-panel p-12 rounded-[2.5rem] border border-white/5 text-center space-y-6">
                <div className="h-20 w-20 rounded-[2.5rem] bg-primary/10 flex items-center justify-center mx-auto border border-primary/20">
                    <Layers className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Roadmap Protocol: PENDING</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto font-light">
                        Complete your AI Assessment and Micro-Simulation to generate a data-driven learning path.
                    </p>
                </div>
                <Button 
                    onClick={() => window.location.href = '/ai-assessment'}
                    className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl gap-3"
                >
                    Initalize Career Engine <Zap className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Sidebar Path Steps */}
            <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center gap-3 px-2 mb-4">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-black text-white uppercase tracking-[0.3em]">Neural Roadmap</h3>
                </div>
                
                <div className="space-y-3">
                    {learningPath.steps.map((step, i) => (
                        <button
                            key={step.skill}
                            onClick={() => setActiveSkill(step.skill)}
                            className={cn(
                                "w-full text-left p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden",
                                activeSkill === step.skill 
                                    ? "bg-primary/20 border-primary/20 text-white shadow-[0_10px_20px_rgba(124,58,237,0.1)] scale-[1.02]" 
                                    : "bg-white/[0.03] border-white/5 text-muted-foreground hover:bg-white/5 hover:border-white/10"
                            )}
                        >
                            {activeSkill === step.skill && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                            )}
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Step {i + 1}</span>
                                {step.status === 'completed' && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                            </div>
                            <h4 className="font-bold text-lg mb-1">{step.skill}</h4>
                            <p className="text-[10px] uppercase font-black tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity">
                                Access Learning Modules <ArrowRight className="inline h-2 w-2 ml-1" />
                            </p>
                        </button>
                    ))}
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest leading-none">
                         <Info className="h-3 w-3" /> Core Algorithm Trace
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed italic opacity-70">
                        {learningPath.steps.find(s => s.skill === activeSkill)?.reason || "Backtracking dependencies... Order optimized for maximal cognitive retention."}
                    </p>
                </div>
            </div>

            {/* Video Learning Area */}
            <div className="lg:col-span-8 space-y-6">
                <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 min-h-[500px]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-white/10">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">{activeSkill} <span className="text-primary italic">Learning Space</span></h2>
                            <p className="text-xs text-muted-foreground font-light flex items-center gap-2">
                                <Youtube className="h-3 w-3 text-red-500" /> YouTube V3 Integration: Neural-Ranked Content
                            </p>
                        </div>
                        <Badge variant="outline" className="h-9 border-primary/20 bg-primary/5 text-primary gap-2 px-4 rounded-xl">
                            <Cpu className="h-3.5 w-3.5" /> High Quality Preference
                        </Badge>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 animate-pulse text-center space-y-4">
                            <div className="h-12 w-12 rounded-full border-t-2 border-primary animate-spin" />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Generating Search Vectors via Qwen...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <AnimatePresence mode="popLayout">
                                {videos.map((vid, i) => (
                                    <motion.div
                                        key={vid.id || i}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="group space-y-3"
                                    >
                                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-black">
                                            <img 
                                                src={vid.thumbnail} 
                                                alt={vid.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                                            />
                                            <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <a href={vid.url} target="_blank" rel="noreferrer">
                                                    <Button className="h-12 w-12 rounded-full bg-white text-black p-0 border-none shadow-2xl">
                                                        <Play className="h-5 w-5 fill-black" />
                                                    </Button>
                                                </a>
                                            </div>
                                            <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-black/80 text-[10px] font-mono text-white">
                                                {vid.duration}
                                            </div>
                                            <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black border border-white/20 shadow-xl">
                                                SCORE: {(vid.score * 100).toFixed(0)}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                                                {vid.title}
                                            </h4>
                                            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                                                <span>{vid.channel}</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-2.5 w-2.5" /> {(vid.viewCount / 1000).toFixed(1)}K Views
                                                </span>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            className="w-full h-10 border border-white/5 hover:border-primary/30 hover:bg-primary/5 text-muted-foreground hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em]"
                                        >
                                            Mark as Completed
                                        </Button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {!isLoading && videos.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <AlertTriangle className="h-12 w-12 text-orange-500/50" />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center max-w-xs">
                                Identity Engine matched zero high-quality artifacts for this skill. Try broadening Assessment scope.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
