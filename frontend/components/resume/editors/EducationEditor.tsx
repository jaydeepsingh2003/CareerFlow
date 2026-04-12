"use client";

import { useResumeStore } from "@/lib/resume-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Plus, Trash2 } from "lucide-react";

export function EducationEditor() {
    const { resumeData, addEducation, updateEducation, removeEducation } = useResumeStore();

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        Education
                    </h2>
                    <p className="text-muted-foreground mt-1 ml-[52px]">Add your educational background.</p>
                </div>
                <Button onClick={addEducation} className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl gap-2 h-10">
                    <Plus className="h-4 w-4" /> Add Education
                </Button>
            </div>

            <AnimatePresence>
                {resumeData.education.map((edu, idx) => (
                    <motion.div key={edu.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Education {idx + 1}</span>
                            <Button variant="ghost" size="icon" onClick={() => removeEducation(edu.id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 w-8">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-300">Degree</Label>
                                <Input value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} placeholder="Bachelor of Science" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 h-10 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-300">Institution</Label>
                                <Input value={edu.institution} onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)} placeholder="MIT" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 h-10 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm text-gray-300">Major / Field</Label>
                                <Input value={edu.major} onChange={(e) => updateEducation(edu.id, 'major', e.target.value)} placeholder="Computer Science" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 h-10 rounded-xl" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-300">Graduation</Label>
                                    <Input value={edu.graduationDate} onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)} placeholder="May 2024" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 h-10 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm text-gray-300">GPA</Label>
                                    <Input value={edu.gpa} onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)} placeholder="3.9/4.0" className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 h-10 rounded-xl" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {resumeData.education.length === 0 && (
                <div className="text-center py-16 glass-card rounded-2xl border border-dashed border-white/10">
                    <GraduationCap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No education added yet</p>
                    <Button onClick={addEducation} className="mt-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl gap-2">
                        <Plus className="h-4 w-4" /> Add Education
                    </Button>
                </div>
            )}
        </motion.div>
    );
}
