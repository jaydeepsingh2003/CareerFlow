"use client";

import { useResumeStore } from "@/lib/resume-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

export function SkillsEditor() {
    const { resumeData, addSkillCategory, updateSkillCategoryName, removeSkillCategory, addSkill, removeSkill } = useResumeStore();
    const [newSkills, setNewSkills] = useState<Record<string, string>>({});

    const handleAddSkill = (catId: string) => {
        const skill = newSkills[catId]?.trim();
        if (skill) {
            addSkill(catId, skill);
            setNewSkills(prev => ({ ...prev, [catId]: '' }));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, catId: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill(catId);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <Zap className="h-5 w-5 text-white" />
                        </div>
                        Skills
                    </h2>
                    <p className="text-muted-foreground mt-1 ml-[52px]">Group your skills by category. Press Enter to add each skill.</p>
                </div>
                <Button onClick={addSkillCategory} className="bg-amber-600 hover:bg-amber-500 text-white rounded-xl gap-2 h-10">
                    <Plus className="h-4 w-4" /> Add Category
                </Button>
            </div>

            <AnimatePresence>
                {resumeData.skills.map((cat) => (
                    <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <Input
                                value={cat.category}
                                onChange={(e) => updateSkillCategoryName(cat.id, e.target.value)}
                                className="bg-transparent border-none text-white font-semibold text-lg p-0 h-auto focus:ring-0 max-w-[200px]"
                            />
                            <Button variant="ghost" size="icon" onClick={() => removeSkillCategory(cat.id)} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 w-8 shrink-0">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {cat.skills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="bg-white/10 text-white border-white/10 gap-1.5 pr-1.5 py-1 text-sm hover:bg-white/15 transition-colors">
                                    {skill}
                                    <button onClick={() => removeSkill(cat.id, skill)} className="hover:text-red-400 transition-colors">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>

                        <div className="flex gap-2">
                            <Input
                                value={newSkills[cat.id] || ''}
                                onChange={(e) => setNewSkills(prev => ({ ...prev, [cat.id]: e.target.value }))}
                                onKeyDown={(e) => handleKeyDown(e, cat.id)}
                                placeholder="Type a skill and press Enter..."
                                className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 h-10 rounded-xl flex-1"
                            />
                            <Button onClick={() => handleAddSkill(cat.id)} className="bg-white/10 hover:bg-white/20 text-white rounded-xl h-10 px-4">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </motion.div>
    );
}
