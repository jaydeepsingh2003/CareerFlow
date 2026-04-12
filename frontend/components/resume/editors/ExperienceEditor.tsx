"use client";

import { useResumeStore } from "@/lib/resume-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, Plus, Trash2, GripVertical, X } from "lucide-react";

export function ExperienceEditor() {
    const {
        resumeData, addExperience, updateExperience, removeExperience,
        addBullet, updateBullet, removeBullet,
    } = useResumeStore();

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Briefcase className="h-6 w-6 text-white" />
                        </div>
                        Professional History
                    </h2>
                    <p className="text-muted-foreground mt-2 ml-[64px] text-sm leading-relaxed">
                        Document your career trajectory. High-impact roles drive recruitment success.
                    </p>
                </div>
                <Button onClick={addExperience} className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl gap-2 h-12 px-6 shadow-lg shadow-blue-600/20 font-bold">
                    <Plus className="h-5 w-5" /> Append Experience
                </Button>
            </div>

            <AnimatePresence>
                {resumeData.experiences.map((exp, idx) => (
                    <motion.div
                        key={exp.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative glass-card p-10 rounded-[2.5rem] border border-white/5 space-y-8 bg-white/[0.02]"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-[10px] font-black text-blue-400 border border-white/5 uppercase tracking-tighter">
                                    0{idx + 1}
                                </span>
                                <span className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">
                                    Role Metadata
                                </span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeExperience(exp.id)} className="text-red-400/50 hover:text-red-400 hover:bg-red-400/10 h-10 w-10 rounded-xl transition-all">
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1">Official Designation</Label>
                                <Input value={exp.jobTitle} onChange={(e) => updateExperience(exp.id, 'jobTitle', e.target.value)} placeholder="Senior Software Architect" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/30 h-12 rounded-2xl focus:ring-blue-500/20" />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1">Entity / Organization</Label>
                                <Input value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} placeholder="Nexus Technologies" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/30 h-12 rounded-2xl focus:ring-blue-500/20" />
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1">Geographic Location</Label>
                                <Input value={exp.location} onChange={(e) => updateExperience(exp.id, 'location', e.target.value)} placeholder="New York, NY (Remote)" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/30 h-12 rounded-2xl focus:ring-blue-500/20" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2.5">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1">Start Timeline</Label>
                                    <Input value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} placeholder="Q1 2022" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/30 h-12 rounded-2xl" />
                                </div>
                                <div className="space-y-2.5">
                                    <Label className="text-[11px] font-black uppercase tracking-widest text-gray-500 ml-1">End Timeline</Label>
                                    <Input value={exp.endDate} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} placeholder="Present" disabled={exp.isCurrent} className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/30 h-12 rounded-2xl disabled:opacity-20 transition-opacity" />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <Switch checked={exp.isCurrent} onCheckedChange={(v) => updateExperience(exp.id, 'isCurrent', v)} className="data-[state=checked]:bg-blue-500" />
                            <Label className="text-sm text-gray-400 font-medium">Currently Engaged in this Role</Label>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-between ml-1">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-gray-500">Impact Metrics & Key Deliverables</Label>
                                <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">Quantification Required</span>
                            </div>
                            
                            <div className="space-y-3">
                                {exp.bullets.map((bullet, bIdx) => (
                                    <div key={bIdx} className="flex gap-4 items-center group/bullet">
                                        <div className="h-10 w-1 shrink-0 bg-blue-500/20 group-focus-within/bullet:bg-blue-500 rounded-full transition-all" />
                                        <Input
                                            value={bullet}
                                            onChange={(e) => updateBullet(exp.id, bIdx, e.target.value)}
                                            placeholder="Engineered high-throughput data pipelines increasing efficiency by 45%..."
                                            className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/30 h-11 rounded-xl flex-1 focus:bg-white/[0.08] transition-all"
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => removeBullet(exp.id, bIdx)} className="text-muted-foreground/30 hover:text-red-400 h-10 w-10 shrink-0 hover:bg-red-400/5 transition-all">
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            
                            <Button variant="ghost" onClick={() => addBullet(exp.id)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 h-10 px-4 rounded-xl text-xs font-black uppercase tracking-widest gap-2 bg-blue-400/5 transition-all w-full md:w-auto">
                                <Plus className="h-4 w-4" /> Expand Log
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {resumeData.experiences.length === 0 && (
                <div className="text-center py-24 glass-panel rounded-[3rem] border-2 border-dashed border-white/5 bg-white/[0.01]">
                    <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="h-10 w-10 text-muted-foreground/20" />
                    </div>
                    <p className="text-muted-foreground font-medium text-lg tracking-tight">Professional Timeline Empty</p>
                    <p className="text-muted-foreground/40 text-sm mt-1 max-w-xs mx-auto">Initiate your career sequence by adding your first professional engagement.</p>
                    <Button onClick={addExperience} className="mt-8 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl gap-3 h-14 px-10 font-black shadow-2xl shadow-blue-600/20">
                        <Plus className="h-5 w-5" /> Initialize First Role
                    </Button>
                </div>
            )}
        </motion.div>
    );
}
