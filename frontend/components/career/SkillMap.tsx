"use client";

import { useAICareerStore } from "@/lib/ai-career-store";
import { motion } from "framer-motion";
import { 
    Brain, Target, Activity, 
    Zap, Sparkles, TrendingUp,
    AlertCircle, CheckCircle2, 
    Monitor, Database, Shield, Layout, Settings
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const SKILL_ICONS: Record<string, any> = {
    'React': Layout,
    'JavaScript': Monitor,
    'API Design': Settings,
    'SQL': Database,
    'PostgreSQL': Database,
    'Security': Shield,
    'AWS': CloudIcon, // Simplified fallback
};

function CloudIcon(props: any) { return <Monitor {...props} /> } // placeholder

export function SkillMap() {
    const { userSkills } = useAICareerStore();

    if (userSkills.length === 0) {
        return (
            <div className="p-8 rounded-[2.5rem] bg-indigo-500/5 border border-indigo-500/10 text-center space-y-4">
                 <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mx-auto border border-indigo-500/20">
                    <Brain className="h-8 w-8 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Skill Map: OFFLINE</h3>
                <p className="text-sm text-muted-foreground font-light max-w-xs mx-auto">
                    Evaluate your technical metadata to generate a visual matrix.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {userSkills.map((skill, i) => {
                    const status = skill.finalScore >= 0.7 ? 'Mastered' : skill.finalScore >= 0.4 ? 'Improving' : 'Weak';
                    const Icon = SKILL_ICONS[skill.name] || Target;
                    
                    return (
                        <motion.div
                            key={skill.skillId}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="p-6 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:border-primary/20 transition-all group overflow-hidden relative shadow-2xl"
                        >
                            {/* Trace/Background */}
                            <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="flex items-start justify-between mb-4">
                                <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                                    <Icon className="h-6 w-6 text-indigo-400 group-hover:text-primary transition-colors" />
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Status</div>
                                    <Badge variant="outline" className={cn(
                                        "capitalize text-[10px] font-bold border-none px-2 py-0 bg-[#0A0A0F]",
                                        status === 'Mastered' ? "text-emerald-500" : status === 'Improving' ? "text-orange-500" : "text-rose-500"
                                    )}>
                                        {status}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xl font-black text-white">{skill.name}</h4>
                                
                                <div className="space-y-2">
                                     <div className="flex items-center justify-between text-[10px] font-mono">
                                        <span className="text-muted-foreground uppercase font-black">Score Velocity</span>
                                        <span className={cn(
                                            "font-bold",
                                            status === 'Mastered' ? "text-emerald-500" : status === 'Improving' ? "text-orange-500" : "text-rose-500"
                                        )}>
                                            {(skill.finalScore * 10).toFixed(1)}/10.0
                                        </span>
                                     </div>
                                     <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            className={cn(
                                                "h-full rounded-full",
                                                status === 'Mastered' ? "bg-emerald-500" : status === 'Improving' ? "bg-orange-500" : "bg-rose-500"
                                            )}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${skill.finalScore * 100}%` }}
                                        />
                                     </div>
                                </div>

                                <div className="pt-2 flex items-center gap-4 text-[10px] uppercase font-bold text-muted-foreground opacity-50 italic">
                                     <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> Fusion Score: 40% Sim</span>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Analysis Trace Display */}
            <div className="p-6 rounded-3xl bg-indigo-500/5 border border-indigo-500/10 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                        <TrendingUp className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                        <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-0.5">Global Rank</h5>
                        <p className="text-lg font-black text-indigo-400 leading-none tracking-tighter">P-82 (High)</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                        <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-0.5">Mastered Skills</h5>
                        <p className="text-lg font-black text-emerald-400 leading-none tracking-tighter">
                            {userSkills.filter(s => s.finalScore >= 0.7).length} Artifacts
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                        <AlertCircle className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                        <h5 className="text-[10px] font-black text-white uppercase tracking-widest mb-0.5">Critical Gaps</h5>
                        <p className="text-lg font-black text-orange-400 leading-none tracking-tighter">
                            {userSkills.filter(s => s.finalScore < 0.4).length} Weaknesses
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
