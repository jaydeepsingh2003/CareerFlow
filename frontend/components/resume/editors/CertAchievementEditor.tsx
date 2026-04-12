"use client";

import { useResumeStore } from "@/lib/resume-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Plus, Trash2, Trophy } from "lucide-react";

export function CertificationsEditor() {
    const { resumeData, addCertification, updateCertification, removeCertification } = useResumeStore();

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                            <Award className="h-5 w-5 text-white" />
                        </div>
                        Certifications
                    </h2>
                    <p className="text-muted-foreground mt-1 ml-[52px]">Professional certifications and licenses.</p>
                </div>
                <Button onClick={addCertification} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl gap-2 h-10">
                    <Plus className="h-4 w-4" /> Add Certification
                </Button>
            </div>
            <AnimatePresence>
                {resumeData.certifications.map((cert, idx) => (
                    <motion.div key={cert.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Certification {idx + 1}</span>
                            <Button variant="ghost" size="icon" onClick={() => removeCertification(cert.id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-300">Certificate Name</Label>
                                <Input value={cert.name} onChange={(e) => updateCertification(cert.id, 'name', e.target.value)} placeholder="AWS Solutions Architect" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 h-10 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-300">Issuing Organization</Label>
                                <Input value={cert.issuer} onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)} placeholder="Amazon Web Services" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 h-10 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-300">Date</Label>
                                <Input value={cert.date} onChange={(e) => updateCertification(cert.id, 'date', e.target.value)} placeholder="Jan 2024" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 h-10 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-300">Credential URL</Label>
                                <Input value={cert.credentialUrl} onChange={(e) => updateCertification(cert.id, 'credentialUrl', e.target.value)} placeholder="https://..." className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 h-10 rounded-xl" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            {resumeData.certifications.length === 0 && (
                <div className="text-center py-16 glass-card rounded-2xl border border-dashed border-white/10">
                    <Award className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No certifications yet</p>
                    <Button onClick={addCertification} className="mt-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl gap-2"><Plus className="h-4 w-4" /> Add Certification</Button>
                </div>
            )}
        </motion.div>
    );
}

export function AchievementsEditor() {
    const { resumeData, addAchievement, updateAchievement, removeAchievement } = useResumeStore();

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                            <Trophy className="h-5 w-5 text-white" />
                        </div>
                        Achievements
                    </h2>
                    <p className="text-muted-foreground mt-1 ml-[52px]">Awards, honors, and notable accomplishments.</p>
                </div>
                <Button onClick={addAchievement} className="bg-yellow-600 hover:bg-yellow-500 text-white rounded-xl gap-2 h-10">
                    <Plus className="h-4 w-4" /> Add Achievement
                </Button>
            </div>
            <AnimatePresence>
                {resumeData.achievements.map((ach, idx) => (
                    <motion.div key={ach.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Achievement {idx + 1}</span>
                            <Button variant="ghost" size="icon" onClick={() => removeAchievement(ach.id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-300">Title</Label>
                                <Input value={ach.title} onChange={(e) => updateAchievement(ach.id, 'title', e.target.value)} placeholder="Best Paper Award" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 h-10 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-300">Date</Label>
                                <Input value={ach.date} onChange={(e) => updateAchievement(ach.id, 'date', e.target.value)} placeholder="2024" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 h-10 rounded-xl" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm text-gray-300">Description</Label>
                            <Input value={ach.description} onChange={(e) => updateAchievement(ach.id, 'description', e.target.value)} placeholder="Won first place in..." className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 h-10 rounded-xl" />
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
            {resumeData.achievements.length === 0 && (
                <div className="text-center py-16 glass-card rounded-2xl border border-dashed border-white/10">
                    <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No achievements yet</p>
                    <Button onClick={addAchievement} className="mt-4 bg-yellow-600 hover:bg-yellow-500 rounded-xl gap-2"><Plus className="h-4 w-4" /> Add Achievement</Button>
                </div>
            )}
        </motion.div>
    );
}
