"use client";

import { useResumeStore } from "@/lib/resume-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

export function ProjectsEditor() {
    const {
        resumeData, addProject, updateProject, removeProject,
        addProjectBullet, updateProjectBullet, removeProjectBullet,
        addProjectTech, removeProjectTech,
    } = useResumeStore();
    const [newTech, setNewTech] = useState<Record<string, string>>({});

    const handleAddTech = (projId: string) => {
        const tech = newTech[projId]?.trim();
        if (tech) {
            addProjectTech(projId, tech);
            setNewTech(prev => ({ ...prev, [projId]: '' }));
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                            <Rocket className="h-5 w-5 text-white" />
                        </div>
                        Projects
                    </h2>
                    <p className="text-muted-foreground mt-1 ml-[52px]">Showcase your best work and side projects.</p>
                </div>
                <Button onClick={addProject} className="bg-pink-600 hover:bg-pink-500 text-white rounded-xl gap-2 h-10">
                    <Plus className="h-4 w-4" /> Add Project
                </Button>
            </div>

            <AnimatePresence>
                {resumeData.projects.map((proj, idx) => (
                    <motion.div key={proj.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Project {idx + 1}</span>
                            <Button variant="ghost" size="icon" onClick={() => removeProject(proj.id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-300">Project Name</Label>
                                <Input value={proj.name} onChange={(e) => updateProject(proj.id, 'name', e.target.value)} placeholder="AI Chat Application" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 h-10 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-300">Live URL</Label>
                                <Input value={proj.liveUrl} onChange={(e) => updateProject(proj.id, 'liveUrl', e.target.value)} placeholder="https://myapp.com" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 h-10 rounded-xl" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm text-gray-300">Description</Label>
                            <Textarea value={proj.description} onChange={(e) => updateProject(proj.id, 'description', e.target.value)} placeholder="A brief description of the project..." className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 rounded-xl min-h-[80px] resize-none" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm text-gray-300">Technologies</Label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {proj.technologies.map((tech, tIdx) => (
                                    <Badge key={tIdx} variant="secondary" className="bg-pink-500/10 text-pink-300 border-pink-500/20 gap-1.5 pr-1.5 py-1 text-sm">
                                        {tech}
                                        <button onClick={() => removeProjectTech(proj.id, tIdx)} className="hover:text-red-400"><X className="h-3 w-3" /></button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={newTech[proj.id] || ''}
                                    onChange={(e) => setNewTech(prev => ({ ...prev, [proj.id]: e.target.value }))}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTech(proj.id); } }}
                                    placeholder="React, Node.js, etc."
                                    className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 h-10 rounded-xl flex-1"
                                />
                                <Button onClick={() => handleAddTech(proj.id)} className="bg-white/10 hover:bg-white/20 text-white rounded-xl h-10 px-4"><Plus className="h-4 w-4" /></Button>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-sm text-gray-300 font-medium">Key Highlights</Label>
                            {proj.bullets.map((bullet, bIdx) => (
                                <div key={bIdx} className="flex gap-2 items-start">
                                    <span className="mt-2.5 text-pink-400 text-xs">•</span>
                                    <Input value={bullet} onChange={(e) => updateProjectBullet(proj.id, bIdx, e.target.value)} placeholder="Built a real-time messaging system..." className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 h-10 rounded-xl flex-1" />
                                    <Button variant="ghost" size="icon" onClick={() => removeProjectBullet(proj.id, bIdx)} className="text-muted-foreground hover:text-red-400 h-10 w-10 shrink-0"><X className="h-3 w-3" /></Button>
                                </div>
                            ))}
                            <Button variant="ghost" onClick={() => addProjectBullet(proj.id)} className="text-pink-400 hover:text-pink-300 h-8 text-xs gap-1">
                                <Plus className="h-3 w-3" /> Add highlight
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {resumeData.projects.length === 0 && (
                <div className="text-center py-16 glass-card rounded-2xl border border-dashed border-white/10">
                    <Rocket className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No projects added yet</p>
                    <Button onClick={addProject} className="mt-4 bg-pink-600 hover:bg-pink-500 rounded-xl gap-2"><Plus className="h-4 w-4" /> Add Project</Button>
                </div>
            )}
        </motion.div>
    );
}
