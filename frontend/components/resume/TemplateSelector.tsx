"use client";

import { useResumeStore } from "@/lib/resume-store";
import { TemplateId } from "@/lib/resume-types";
import { motion } from "framer-motion";
import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const TEMPLATES: { id: TemplateId; name: string; description: string; accent: string; preview: string }[] = [
    {
        id: 'executive',
        name: 'Executive',
        description: 'Classic, ATS-friendly layout with bold headers. Ideal for senior roles.',
        accent: 'from-slate-600 to-slate-800',
        preview: 'border-l-4 border-slate-500',
    },
    {
        id: 'modern',
        name: 'Modern',
        description: 'Clean two-column design with subtle color accents and clear hierarchy.',
        accent: 'from-blue-600 to-indigo-700',
        preview: 'border-l-4 border-blue-500',
    },
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Ultra-clean with generous whitespace. Lets your content speak for itself.',
        accent: 'from-gray-400 to-gray-600',
        preview: 'border-l-4 border-gray-400',
    },
    {
        id: 'creative',
        name: 'Creative',
        description: 'Bold typography with vibrant gradient accents. Stand out from the crowd.',
        accent: 'from-purple-600 to-pink-600',
        preview: 'border-l-4 border-purple-500',
    },
    {
        id: 'developer',
        name: 'Developer',
        description: 'Monospace headers, terminal-inspired design. Built for tech professionals.',
        accent: 'from-emerald-600 to-teal-700',
        preview: 'border-l-4 border-emerald-500',
    },
];

export function TemplateSelector() {
    const { selectedTemplate, setTemplate } = useResumeStore();

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <Palette className="h-5 w-5 text-white" />
                    </div>
                    Choose Your Template
                </h2>
                <p className="text-muted-foreground mt-1 ml-[52px]">Select the design that best represents your professional brand.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {TEMPLATES.map((tmpl) => {
                    const isActive = selectedTemplate === tmpl.id;
                    return (
                        <motion.button
                            key={tmpl.id}
                            onClick={() => setTemplate(tmpl.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                                "relative text-left p-6 rounded-2xl border-2 transition-all duration-300 group",
                                isActive
                                    ? "border-purple-500 bg-purple-500/10 shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                                    : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute top-3 right-3 h-7 w-7 rounded-full bg-purple-500 flex items-center justify-center"
                                >
                                    <Check className="h-4 w-4 text-white" />
                                </motion.div>
                            )}

                            {/* Mini preview */}
                            <div className={cn("h-32 rounded-xl mb-4 bg-gradient-to-br opacity-20 group-hover:opacity-30 transition-opacity", tmpl.accent)} />

                            <div className={cn("h-1 w-16 rounded-full mb-3 bg-gradient-to-r", tmpl.accent)} />
                            <h3 className="text-lg font-bold text-white mb-1">{tmpl.name}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{tmpl.description}</p>
                        </motion.button>
                    );
                })}
            </div>
        </motion.div>
    );
}
