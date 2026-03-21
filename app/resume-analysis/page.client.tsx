'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, AlertTriangle, XCircle, Loader2, Sparkles, BookOpen, Key, Target, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { toast } from 'sonner';

export default function ResumeAnalysisPage() {
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!resumeFile) {
            toast.error('Please upload a resume (PDF)');
            return;
        }
        if (!jobDescription.trim()) {
            toast.error('Please enter a job description');
            return;
        }

        setIsAnalyzing(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('resume', resumeFile);
            formData.append('jobDescription', jobDescription);

            // Fetch from backend API
            const response = await fetch('http://localhost:3001/resume-analysis/analyze', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.message || 'Failed to analyze resume and JD');
            }

            const data = await response.json();
            setResult(data);
            toast.success('Analysis complete!');
            
        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'An error occurred during analysis');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white p-6 md:p-12 font-sans selection:bg-purple-500/30">
            {/* Header */}
            <header className="max-w-6xl mx-auto mb-12 text-center pt-8">
                <div className="inline-flex items-center justify-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-6">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium tracking-wide">Qwen Intelligence Engine</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-br from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
                    Resume & JD Skill Gap Analyzer
                </h1>
                <p className="text-lg text-neutral-400 max-w-2xl mx-auto font-light">
                    Upload your resume and the target job description. Our deterministic engine will extract skills, 
                    calculate gaps, and generate a customized learning roadmap.
                </p>
            </header>

            <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Input Section */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Upload Card */}
                    <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        
                        <div className="relative z-10">
                            <h2 className="text-xl font-semibold mb-6 flex items-center">
                                <FileText className="w-5 h-5 mr-3 text-purple-400" />
                                1. Upload Resume
                            </h2>
                            
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${resumeFile ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/10 hover:border-purple-500/30 hover:bg-white/[0.02]'}`}
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    className="hidden" 
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileChange}
                                />
                                {resumeFile ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                                            <CheckCircle className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <p className="font-medium text-white">{resumeFile.name}</p>
                                        <p className="text-xs text-neutral-500 mt-1">Ready for analysis</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                            <UploadCloud className="w-6 h-6 text-neutral-400 group-hover:text-purple-400 transition-colors" />
                                        </div>
                                        <p className="font-medium text-neutral-300">Click to upload PDF or DOCX</p>
                                        <p className="text-xs text-neutral-500 mt-2">Max file size 5MB</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* JD Card */}
                    <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                        
                        <div className="relative z-10">
                            <h2 className="text-xl font-semibold mb-6 flex items-center">
                                <Target className="w-5 h-5 mr-3 text-blue-400" />
                                2. Job Description
                            </h2>
                            
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here..."
                                className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-neutral-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-none transition-all placeholder:text-neutral-600"
                            />
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="w-full relative group overflow-hidden rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 group-hover:scale-105" />
                        <div className="relative px-6 py-4 flex items-center justify-center text-lg font-semibold tracking-wide">
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                    Analyzing AI Engines...
                                </>
                            ) : (
                                <>
                                    Run Intelligence Engine
                                    <Sparkles className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </div>
                    </button>
                </div>

                {/* Output Section */}
                <div className="lg:col-span-7">
                    <AnimatePresence mode="wait">
                        {!result && !isAnalyzing && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="h-full border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-12 text-center bg-white/[0.01]"
                            >
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                    <RefreshCw className="w-8 h-8 text-neutral-500" />
                                </div>
                                <h3 className="text-xl font-medium text-neutral-300 mb-2">Awaiting Input</h3>
                                <p className="text-neutral-500 max-w-sm">Provide your resume and the target job description to generate a comprehensive gap analysis and personalized learning path.</p>
                            </motion.div>
                        )}

                        {isAnalyzing && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="h-full border border-white/5 bg-neutral-900/50 rounded-3xl flex flex-col items-center justify-center p-12 overflow-hidden relative"
                            >
                                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500 via-transparent to-transparent animate-pulse" />
                                
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="relative w-24 h-24 mb-8">
                                        <div className="absolute inset-0 border-t-2 border-purple-500 rounded-full animate-spin" style={{ animationDuration: '1s' }} />
                                        <div className="absolute inset-2 border-r-2 border-blue-500 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }} />
                                        <div className="absolute inset-4 border-b-2 border-white rounded-full animate-spin" style={{ animationDuration: '2s' }} />
                                        <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-purple-400 animate-pulse" />
                                    </div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 text-transparent bg-clip-text mb-2">Analyzing Data</h3>
                                    <p className="text-neutral-400">Parsing documents and calculating deterministic skill gaps...</p>
                                </div>
                            </motion.div>
                        )}

                        {result && !isAnalyzing && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6"
                            >
                                {/* Overview Stats */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-5 flex flex-col items-center text-center">
                                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                                            <XCircle className="w-5 h-5 text-red-400" />
                                        </div>
                                        <span className="text-3xl font-bold text-white mb-1">{result.gapAnalysis.missing_skills.length}</span>
                                        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Missing Skills</span>
                                    </div>
                                    <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-5 flex flex-col items-center text-center">
                                        <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
                                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                                        </div>
                                        <span className="text-3xl font-bold text-white mb-1">{result.gapAnalysis.weak_skills.length}</span>
                                        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Weak Skills</span>
                                    </div>
                                    <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-5 flex flex-col items-center text-center">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <span className="text-3xl font-bold text-white mb-1">{result.gapAnalysis.strong_skills.length}</span>
                                        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">Strong Skills</span>
                                    </div>
                                </div>

                                {/* Extracted Data Preview */}
                                <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8">
                                    <h3 className="text-xl font-semibold mb-6 flex items-center">
                                        <Key className="w-5 h-5 mr-3 text-purple-400" />
                                        Extraction Preview
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-black/40 rounded-2xl p-5 border border-white/5">
                                            <h4 className="text-sm font-medium text-neutral-400 mb-3 uppercase tracking-wider">Resume Profile</h4>
                                            <div className="mb-4">
                                                <span className="text-xs text-neutral-500 block mb-1">Domain</span>
                                                <span className="text-sm text-white font-medium bg-white/5 px-2 py-1 rounded inline-block">{result.domain || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-neutral-500 block mb-2">Detected Skills</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {result.skillsExtracted?.slice(0, 8).map((s: any, i: number) => (
                                                        <span key={i} className="text-xs bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-1 rounded-full">
                                                            {s.name} ({(s.level * 100).toFixed(0)}%)
                                                        </span>
                                                    ))}
                                                    {result.skillsExtracted?.length > 8 && (
                                                        <span className="text-xs bg-white/5 text-neutral-400 px-2 py-1 rounded-full border border-white/5">
                                                            +{result.skillsExtracted.length - 8} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-black/40 rounded-2xl p-5 border border-white/5">
                                            <h4 className="text-sm font-medium text-neutral-400 mb-3 uppercase tracking-wider">Job Requirements</h4>
                                            <div className="mb-4">
                                                <span className="text-xs text-neutral-500 block mb-1">Role</span>
                                                <span className="text-sm text-white font-medium bg-white/5 px-2 py-1 rounded inline-block">{result.jobRole || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-neutral-500 block mb-2">Required Skills</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {result.requiredSkillsExtracted?.slice(0, 8).map((s: any, i: number) => (
                                                        <span key={i} className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-1 rounded-full">
                                                            {s.name}
                                                        </span>
                                                    ))}
                                                     {result.requiredSkillsExtracted?.length > 8 && (
                                                        <span className="text-xs bg-white/5 text-neutral-400 px-2 py-1 rounded-full border border-white/5">
                                                            +{result.requiredSkillsExtracted.length - 8} more
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed Gap Categories */}
                                <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 md:p-8">
                                    <h3 className="text-xl font-semibold mb-6 flex items-center">
                                        <Layers className="w-5 h-5 mr-3 text-purple-400" />
                                        Deterministic Gap Analysis
                                    </h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                        {/* Missing Skills */}
                                        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5">
                                            <h4 className="flex items-center text-sm font-semibold text-red-400 mb-4 uppercase tracking-wider">
                                                <XCircle className="w-4 h-4 mr-2" /> Missing Skills
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {result.gapAnalysis.missing_skills.length > 0 ? (
                                                    result.gapAnalysis.missing_skills.map((s: any, i: number) => (
                                                        <span key={i} className="px-2 py-1 rounded bg-black/40 border border-red-500/30 text-red-200 text-xs font-medium">
                                                            {s.skill}
                                                        </span>
                                                    ))
                                                ) : <span className="text-xs text-neutral-500">None found</span>}
                                            </div>
                                        </div>

                                        {/* Weak Skills */}
                                        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5">
                                            <h4 className="flex items-center text-sm font-semibold text-amber-400 mb-4 uppercase tracking-wider">
                                                <AlertTriangle className="w-4 h-4 mr-2" /> Weak Skills
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {result.gapAnalysis.weak_skills.length > 0 ? (
                                                    result.gapAnalysis.weak_skills.map((s: any, i: number) => (
                                                        <span key={i} className="px-2 py-1 rounded bg-black/40 border border-amber-500/30 text-amber-200 text-xs font-medium">
                                                            {s.skill}
                                                        </span>
                                                    ))
                                                ) : <span className="text-xs text-neutral-500">None found</span>}
                                            </div>
                                        </div>

                                        {/* Strong Skills */}
                                        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
                                            <h4 className="flex items-center text-sm font-semibold text-emerald-400 mb-4 uppercase tracking-wider">
                                                <CheckCircle className="w-4 h-4 mr-2" /> Strong Skills
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {result.gapAnalysis.strong_skills.length > 0 ? (
                                                    result.gapAnalysis.strong_skills.map((s: any, i: number) => (
                                                        <span key={i} className="px-2 py-1 rounded bg-black/40 border border-emerald-500/30 text-emerald-200 text-xs font-medium">
                                                            {s.skill}
                                                        </span>
                                                    ))
                                                ) : <span className="text-xs text-neutral-500">None found</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold mb-4 flex items-center mt-6">
                                        <AlertCircle className="w-5 h-5 mr-3 text-blue-400" />
                                        Reasoning Trace
                                    </h3>
                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {result.reasoningTrace?.map((trace: any, index: number) => {
                                            let borderColor = 'border-white/5';
                                            let icon = <CheckCircle className="w-4 h-4 text-emerald-400 mt-1" />;
                                            
                                            if (trace.reason.includes('Gap score: 0.00') || trace.reason.includes('Gap score: 0.1')) {
                                                borderColor = 'border-emerald-500/20 bg-emerald-500/5';
                                            } else if (trace.reason.includes('Gap score: 0.2') || trace.reason.includes('Gap score: 0.3') || trace.reason.includes('Gap score: 0.4') || trace.reason.includes('Gap score: 0.50')) {
                                                borderColor = 'border-amber-500/20 bg-amber-500/5';
                                                icon = <AlertTriangle className="w-4 h-4 text-amber-400 mt-1" />;
                                            } else {
                                                borderColor = 'border-red-500/20 bg-red-500/5';
                                                icon = <XCircle className="w-4 h-4 text-red-400 mt-1" />;
                                            }

                                            return (
                                                <div key={index} className={`p-4 rounded-2xl border ${borderColor} flex items-start gap-4`}>
                                                    {icon}
                                                    <div>
                                                        <h4 className="font-medium text-white mb-2">{trace.skill} Analysis</h4>
                                                        <pre className="text-sm text-neutral-400 font-mono whitespace-pre-wrap leading-relaxed bg-black/30 p-3 rounded-xl border border-white/5">{trace.reason}</pre>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {result.reasoningTrace?.length === 0 && (
                                            <div className="text-center py-8 text-neutral-500">No reasoning trace generated.</div>
                                        )}
                                    </div>
                                </div>

                                {/* Learning Roadmap */}
                                <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                                     <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full point-events-none" />
                                     
                                    <h3 className="text-xl font-semibold mb-6 flex items-center relative z-10">
                                        <BookOpen className="w-5 h-5 mr-3 text-purple-400" />
                                        Personalized Learning Roadmap
                                    </h3>

                                    {result.learningPath?.length > 0 ? (
                                        <div className="space-y-4 relative z-10">
                                            {result.learningPath.map((step: string, index: number) => (
                                                <div key={index} className="flex flex-row items-center bg-black/40 border border-white/5 p-4 rounded-2xl hover:border-purple-500/30 transition-colors">
                                                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-sm shrink-0 mr-4">
                                                        {index + 1}
                                                    </div>
                                                    <p className="text-neutral-200">{step}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 relative z-10">
                                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                                            </div>
                                            <h4 className="text-lg font-medium text-white mb-2">No Gaps Found!</h4>
                                            <p className="text-neutral-400 max-w-sm mx-auto">Your resume perfectly aligns with the job requirements. No additional learning roadmap is needed.</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}} />
        </div>
    );
}
