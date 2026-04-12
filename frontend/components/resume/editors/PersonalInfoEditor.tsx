"use client";

import { useResumeStore } from "@/lib/resume-store";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Linkedin, Github, Globe, FileText } from "lucide-react";

export function PersonalInfoEditor() {
    const { resumeData, updatePersonalInfo } = useResumeStore();
    const pi = resumeData.personalInfo;

    const fields = [
        { key: 'fullName' as const, label: 'Full Name', placeholder: 'John Doe', icon: User },
        { key: 'email' as const, label: 'Email', placeholder: 'john@example.com', icon: Mail },
        { key: 'phone' as const, label: 'Phone', placeholder: '+1 (555) 123-4567', icon: Phone },
        { key: 'location' as const, label: 'Location', placeholder: 'San Francisco, CA', icon: MapPin },
        { key: 'linkedin' as const, label: 'LinkedIn', placeholder: 'linkedin.com/in/johndoe', icon: Linkedin },
        { key: 'github' as const, label: 'GitHub', placeholder: 'github.com/johndoe', icon: Github },
        { key: 'portfolio' as const, label: 'Portfolio', placeholder: 'johndoe.dev', icon: Globe },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div>
                <h2 className="text-3xl font-black text-white flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <User className="h-6 w-6 text-white" />
                    </div>
                    Core Identity
                </h2>
                <p className="text-muted-foreground mt-2 ml-[64px] text-sm leading-relaxed">
                    Define your professional anchor. These details populate the header of your finalized resume.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {fields.map((field) => (
                    <div key={field.key} className="space-y-2.5">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400 ml-1">{field.label}</Label>
                        <div className="relative group">
                            <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                value={pi[field.key]}
                                onChange={(e) => updatePersonalInfo(field.key, e.target.value)}
                                placeholder={field.placeholder}
                                className="pl-12 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/30 focus:border-primary/50 focus:ring-primary/20 h-12 rounded-2xl transition-all"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-3 mt-8">
                <div className="flex items-center justify-between ml-1">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-gray-400">Professional Narrative</Label>
                    <span className="text-[10px] text-muted-foreground font-mono">
                        {pi.summary.length}/500
                    </span>
                </div>
                <Textarea
                    value={pi.summary}
                    onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                    placeholder="Solution-oriented architect with a passion for high-performance systems..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/30 focus:border-primary/50 focus:ring-primary/20 min-h-[160px] rounded-[2rem] resize-none p-6 pt-5 leading-relaxed"
                />
            </div>
        </motion.div>
    );
}
