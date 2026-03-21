"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, XCircle, Loader2, Sparkles, Briefcase, Target, ExternalLink, Info, Search, Database } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function JobAlignmentClient() {
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<any[] | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!resumeFile) {
            toast.error('Please upload your resume (PDF)');
            return;
        }

        setIsAnalyzing(true);
        setResults(null);

        try {
            const formData = new FormData();
            formData.append('resume', resumeFile);

            const response = await fetch('http://localhost:3001/job-alignment/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.message || 'Failed to align jobs');
            }

            const data = await response.json();
            setResults(data);
            toast.success('Job alignment complete!');
            
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'An error occurred during analysis');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-primary/30">
            {/* Header Section */}
            <header className="max-w-6xl mx-auto mb-16 text-center pt-8">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center justify-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6"
                >
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-black tracking-widest uppercase">Llama-3.3 Intelligence</span>
                </motion.div>
                
                <motion.h1 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent uppercase italic"
                >
                    Resume Alignment <span className="text-primary not-italic">Matrix</span>
                </motion.h1>
                
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg text-neutral-500 max-w-2xl mx-auto font-medium"
                >
                    Upload your profile to trigger a high-fidelity cross-reference across Adzuna & The Muse global job registries.
                </motion.p>
            </header>

            <main className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Upload Section */}
                    <div className="lg:col-span-4 space-y-8">
                        <section className="glass-panel p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10" />
                            
                            <h2 className="text-xl font-black mb-8 flex items-center tracking-tighter uppercase italic">
                                <FileText className="w-5 h-5 mr-3 text-primary" />
                                1. Source Profile
                            </h2>
                            
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`group relative border-2 border-dashed rounded-[2rem] p-10 text-center cursor-pointer transition-all duration-500 ${resumeFile ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-primary/30 hover:bg-white/[0.04]'}`}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    className="hidden" 
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                />
                                {resumeFile ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 rotate-3 group-hover:rotate-0 transition-transform">
                                            <CheckCircle className="w-8 h-8 text-primary" />
                                        </div>
                                        <p className="font-bold text-white truncate max-w-full italic">{resumeFile.name}</p>
                                        <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest mt-2">Vectorized Ready</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500">
                                            <UploadCloud className="w-8 h-8 text-neutral-400 group-hover:text-primary transition-colors" />
                                        </div>
                                        <p className="font-bold text-neutral-300 uppercase tracking-tighter">Initialize Upload</p>
                                        <p className="text-[10px] text-neutral-500 mt-2 font-black tracking-widest uppercase italic">X-PDF ONLY</p>
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || !resumeFile}
                                className="w-full mt-8 h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest italic transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                        MAPPING MATRIX...
                                    </>
                                ) : (
                                    <>
                                        ANALYZE & FIND JOBS
                                        <Search className="w-5 h-5 ml-3" />
                                    </>
                                )}
                            </Button>
                        </section>

                        <section className="p-6 rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                            <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Database className="w-4 h-4 text-primary" /> Registry Status
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-neutral-500 font-bold">ADZUNA ENGINE</span>
                                    <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/10 border-none px-2 h-4 text-[9px] font-black">ACTIVE</Badge>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-neutral-500 font-bold">THE MUSE API</span>
                                    <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/10 border-none px-2 h-4 text-[9px] font-black">ACTIVE</Badge>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-neutral-500 font-bold">LLAMA 3.3 70B</span>
                                    <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none px-2 h-4 text-[9px] font-black">REASONING</Badge>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Results Section */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {!results && !isAnalyzing && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-[600px] border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center p-12 text-center bg-white/[0.01]"
                                >
                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 relative">
                                        <Briefcase className="w-10 h-10 text-neutral-700" />
                                        <div className="absolute inset-0 border border-white/10 rounded-full animate-ping opacity-20" />
                                    </div>
                                    <h3 className="text-3xl font-black text-neutral-300 mb-4 tracking-tighter uppercase italic">Registry Idle</h3>
                                    <p className="text-neutral-500 max-w-sm mx-auto font-medium">Upload your resume to begin a deterministic matching cycle against live job feeds.</p>
                                </motion.div>
                            )}

                            {isAnalyzing && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-[600px] bg-neutral-900/40 backdrop-blur-3xl rounded-[3rem] flex flex-col items-center justify-center p-12 overflow-hidden relative border border-white/5"
                                >
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
                                    
                                    <div className="relative z-10 flex flex-col items-center text-center">
                                        <div className="relative w-32 h-32 mb-10">
                                            <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin" style={{ animationDuration: '0.6s' }} />
                                            <div className="absolute inset-4 border-r-2 border-primary/40 rounded-full animate-spin" style={{ animationDuration: '1s', animationDirection: 'reverse' }} />
                                            <Database className="absolute inset-0 m-auto w-10 h-10 text-primary animate-pulse" />
                                        </div>
                                        <h3 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-4 animate-pulse">Analyzing Registry</h3>
                                        <div className="space-y-2">
                                            <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Parsing Resume Buffers</p>
                                            <p className="text-neutral-500 font-medium italic">Fetching live node data from Adzuna & Muse API core...</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {results && !isAnalyzing && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center justify-between mb-8 px-2">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Found {results.length} Matches</h2>
                                            <Badge className="bg-primary hover:bg-primary text-[10px] font-black rounded-md px-2 py-0.5 border-none">TOP RANKED</Badge>
                                        </div>
                                        <p className="text-[10px] font-black text-neutral-500 tracking-[0.2em] uppercase">High fidelity results</p>
                                    </div>

                                    <div className="space-y-6">
                                        {results.map((job: any, i: number) => (
                                            <motion.div 
                                                key={i}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="glass-panel p-6 md:p-8 rounded-[2rem] border border-white/10 bg-white/[0.03] hover:bg-white/[0.05] hover:border-primary/40 transition-all duration-300 group"
                                            >
                                                <div className="flex flex-col md:flex-row gap-8">
                                                    {/* Score Column */}
                                                    <div className="md:w-32 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-8">
                                                        <div className="relative w-20 h-20 flex items-center justify-center">
                                                            <svg className="w-full h-full -rotate-90">
                                                                <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                                                                <circle cx="40" cy="40" r="36" fill="transparent" stroke="currentColor" strokeWidth="6" strokeDasharray={226} strokeDashoffset={226 - (226 * job.match_score) / 100} className="text-primary transition-all duration-1000" />
                                                            </svg>
                                                            <span className="absolute text-xl font-black text-white italic">{job.match_score}%</span>
                                                        </div>
                                                        <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mt-3">ALIGNMENT</span>
                                                    </div>

                                                    {/* content column */}
                                                    <div className="flex-1 space-y-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-1 leading-none group-hover:text-primary transition-colors">{job.title}</h3>
                                                                <p className="text-sm font-bold text-neutral-400 flex items-center gap-2">
                                                                    {job.company} 
                                                                    <span className="h-1 w-1 bg-neutral-700 rounded-full" /> 
                                                                    <span className="opacity-60">{job.location}</span>
                                                                </p>
                                                            </div>
                                                            <a href={job.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-2xl hover:bg-primary hover:text-white transition-all">
                                                                <ExternalLink className="w-5 h-5" />
                                                            </a>
                                                        </div>

                                                        {/* Llama Reasoning */}
                                                        <div className="bg-black/60 rounded-2xl p-4 border border-white/5 flex gap-3">
                                                            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                            <p className="text-xs font-medium leading-relaxed text-neutral-400 italic">
                                                                "{job.reason}"
                                                            </p>
                                                        </div>

                                                        {/* Skill Gaps */}
                                                        <div className="flex flex-wrap gap-2">
                                                            {job.strong_skills.slice(0, 3).map((s: string, idx: number) => (
                                                                <span key={idx} className="bg-green-500/10 text-green-500 text-[10px] font-black px-2 py-1 rounded-lg uppercase border border-green-500/20">
                                                                    {s}
                                                                </span>
                                                            ))}
                                                            {job.missing_skills.slice(0, 3).map((s: string, idx: number) => (
                                                                <span key={idx} className="bg-red-500/10 text-red-500 text-[10px] font-black px-2 py-1 rounded-lg uppercase border border-red-500/20">
                                                                    Missing: {s}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </main>
        </div>
    );
}
