"use client";

import { useResumeStore } from "@/lib/resume-store";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Globe, Share2, Eye, Layout, Rocket, Briefcase, 
    GraduationCap, Mail, Phone, Linkedin, Github, 
    ExternalLink, Code, Layers, Sparkles 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

export default function PortfolioPage() {
    const { resumeData } = useResumeStore();
    const pi = resumeData.personalInfo;
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

    const handleShare = () => {
        navigator.clipboard.writeText(`https://portfolio.kodnest.com/${pi.fullName.toLowerCase().replace(/\s+/g, '-')}`);
        toast.success("Protocol URL copied to clipboard");
    };

    if (!pi.fullName) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-6">
                <div className="h-20 w-20 rounded-[2.5rem] bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                    <Rocket className="h-10 w-10 text-indigo-400" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Project: Identity Failure</h2>
                    <p className="text-muted-foreground max-w-sm">
                        Our engine cannot deploy a portfolio without identity metadata. Please complete the Resume Builder steps first.
                    </p>
                </div>
                <Button 
                    onClick={() => window.location.href = '/resume'}
                    className="h-12 px-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl gap-3"
                >
                    Initialize Builder Protocol
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-full space-y-12 pb-20">
            {/* Header Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white tracking-tight">PORTFOLIO <span className="text-indigo-400 italic">WEB</span></h1>
                    <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold opacity-60">Live Rendering: {pi.fullName}</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="bg-white/5 p-1 rounded-2xl border border-white/5 flex gap-1">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setViewMode('desktop')}
                            className={cn("h-8 rounded-xl px-3 text-xs gap-2", viewMode === 'desktop' ? "bg-white/10 text-white" : "text-muted-foreground")}
                        >
                            <Layout className="h-3 w-3" /> Desktop
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setViewMode('mobile')}
                            className={cn("h-8 rounded-xl px-3 text-xs gap-2", viewMode === 'mobile' ? "bg-white/10 text-white" : "text-muted-foreground")}
                        >
                            <Rocket className="h-3 w-3" /> Mobile
                        </Button>
                    </div>
                    <Button 
                        onClick={handleShare}
                        className="h-11 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl gap-2 font-bold shadow-[0_10px_30px_rgba(79,70,229,0.3)]"
                    >
                        <Share2 className="h-4 w-4" /> Deploy & Share
                    </Button>
                </div>
            </div>

            {/* Portfolio Rendering Area */}
            <div className={cn(
                "transition-all duration-700 mx-auto border border-white/10 rounded-[3rem] overflow-hidden bg-[#0A0A0F] shadow-2xl relative",
                viewMode === 'desktop' ? "w-full min-h-[1000px]" : "w-[390px] min-h-[844px] border-8 border-white/20"
            )}>
                {/* Visual Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-blue-600/5 rounded-full blur-[120px]" />
                    <div className="absolute inset-0 bg-dot-white opacity-[0.03]" />
                </div>

                <div className="relative z-10 w-full h-full p-8 md:p-16 space-y-24">
                    {/* Hero Section */}
                    <section className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-px w-12 bg-indigo-400 opacity-40" />
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em]">Identity Protocol v4</span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                                I'M {pi.fullName.toUpperCase()}
                            </h2>
                            <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl leading-relaxed">
                                {pi.summary}
                            </p>
                        </motion.div>
                        
                        <div className="flex flex-wrap gap-4 pt-4">
                            {[
                                { icon: Mail, label: pi.email, href: `mailto:${pi.email}` },
                                { icon: Linkedin, label: 'LinkedIn', href: pi.linkedin },
                                { icon: Github, label: 'GitHub', href: pi.github },
                                { icon: Globe, label: 'Portfolio', href: pi.portfolio }
                            ].filter(c => c.label).map((link, i) => (
                                <motion.a
                                    key={i}
                                    href={link.href}
                                    target="_blank"
                                    rel="noreferrer"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/5 text-sm text-gray-300 hover:text-white hover:bg-white/10 hover:border-indigo-500/30 transition-all font-medium"
                                >
                                    <link.icon className="h-4 w-4" />
                                    {link.label}
                                </motion.a>
                            ))}
                        </div>
                    </section>

                    {/* Skills Grid */}
                    <section className="space-y-12">
                        <div className="flex items-center gap-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">Neural Matrix</h3>
                            <div className="h-px w-full bg-white/5" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {resumeData.skills.filter(cat => cat.skills.length > 0).map((cat, i) => (
                                <motion.div
                                    key={cat.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-indigo-500/20 transition-all flex flex-col items-center justify-center text-center space-y-4 group"
                                >
                                    <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all">
                                        <Code className="h-6 w-6 text-indigo-400" />
                                    </div>
                                    <h4 className="text-lg font-bold text-white uppercase tracking-wider">{cat.category}</h4>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {cat.skills.map(s => (
                                            <Badge key={s} variant="outline" className="px-3 py-1 bg-white/5 border-white/10 text-gray-400 capitalize hover:text-white transition-colors">
                                                {s}
                                            </Badge>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Career History */}
                    <section className="space-y-12">
                         <div className="flex items-center gap-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">Career Path</h3>
                            <div className="h-px w-full bg-white/5" />
                        </div>
                        
                        <div className="space-y-6">
                            {resumeData.experiences.map((exp, i) => (
                                <motion.div
                                    key={exp.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="group relative pl-8 md:pl-12 py-4"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-white/5 group-hover:bg-indigo-500/30 transition-colors" />
                                    <div className="absolute left-[-4px] top-6 h-2 w-2 rounded-full bg-white/20 group-hover:bg-indigo-500 group-hover:scale-150 transition-all" />
                                    
                                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                                        <h4 className="text-xl font-bold text-white">{exp.jobTitle} @ <span className="text-indigo-400">{exp.company}</span></h4>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                                            {exp.startDate} — {exp.isCurrent ? 'Current' : exp.endDate}
                                        </span>
                                    </div>
                                    <p className="text-lg text-gray-400 font-light mb-4 max-w-3xl">
                                        {exp.bullets[0]}
                                    </p>
                                    <div className="flex gap-4">
                                        {exp.location && (
                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                <Globe className="h-3 w-3" /> {exp.location}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                            <Sparkles className="h-3 w-3" /> Technical Influence: High
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Project Gallery */}
                    <section className="space-y-12">
                         <div className="flex items-center gap-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.4em] whitespace-nowrap">Project Archive</h3>
                            <div className="h-px w-full bg-white/5" />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {resumeData.projects.map((proj, i) => (
                                <motion.div
                                    key={proj.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="p-8 rounded-[2.5rem] bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/5 hover:border-indigo-500/40 transition-all space-y-6 group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                                            <Rocket className="h-6 w-6" />
                                        </div>
                                        <div className="flex gap-2">
                                            {proj.repoUrl && (
                                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white h-10 w-10">
                                                    <Github className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {proj.liveUrl && (
                                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white h-10 w-10">
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-2xl font-black text-white">{proj.name}</h4>
                                        <p className="text-gray-400 font-light leading-relaxed">
                                            {proj.description}
                                        </p>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {proj.technologies.slice(0, 4).map(t => (
                                                <span key={t} className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                                                    #{t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <Button variant="link" className="p-0 h-auto text-indigo-400 font-bold uppercase tracking-widest text-[10px] group-hover:gap-2 transition-all">
                                        View Protocol <ExternalLink className="h-3 w-3" />
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* Contact CTA */}
                    <section className="p-12 md:p-20 rounded-[3rem] bg-indigo-600 overflow-hidden relative group">
                        <div className="absolute right-[-10%] top-[-20%] w-[50%] h-[150%] bg-indigo-500/40 rotate-12 -z-0" />
                        <div className="relative z-10 space-y-6">
                            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none">
                                START A CONVERSATION <br /> WITH THE DEVELOPER
                            </h3>
                            <p className="text-indigo-100 text-lg md:text-xl font-medium max-w-xl">
                                Available for high-impact roles and surgical engineering challenges.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                                <Button className="h-16 px-10 bg-white text-indigo-600 hover:bg-white/90 rounded-2xl font-black text-lg gap-3 w-full sm:w-auto">
                                    Send Transmission <Mail className="h-5 w-5" />
                                </Button>
                                <Button variant="ghost" className="h-16 px-10 text-white hover:bg-white/10 rounded-2xl font-bold text-lg gap-3 w-full sm:w-auto">
                                    View Repository <Github className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* Portfolio Footer */}
                    <footer className="text-center pt-24 border-t border-white/5 opacity-40">
                         <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="h-6 w-6 rounded-lg bg-indigo-500 flex items-center justify-center">
                                <span className="text-white font-black text-[10px]">K</span>
                            </div>
                            <span className="font-bold tracking-tighter text-white">KodNestCareers</span>
                        </div>
                        <p className="text-[8px] font-mono text-muted-foreground uppercase tracking-[0.4em]">
                             Deployed via AI Resume & Portfolio Builder Engine v4.0 // All Rights Reserved
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}
