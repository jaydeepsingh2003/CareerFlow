"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useReadinessStore } from "@/lib/store";
import { BookOpen, ExternalLink } from "lucide-react";

export function ReadinessChecklist() {
    const { plan } = useReadinessStore();
    const [completed, setCompleted] = useState<string[]>([]);

    const tasks = plan?.prepPlan?.tasks || [];

    const toggleTask = (id: string) => {
        if (completed.includes(id)) {
            setCompleted(completed.filter((c) => c !== id));
        } else {
            setCompleted([...completed, id]);
        }
    };

    if (!plan && tasks.length === 0) {
        return (
            <div className="glass-card p-6 rounded-2xl border border-dashed border-white/10 h-full flex items-center justify-center text-center">
                <p className="text-muted-foreground text-sm">Action items will appear here after JD analysis.</p>
            </div>
        );
    }

    return (
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden h-full border border-white/10">
            <div className="absolute top-0 right-0 p-6 opacity-10 text-9xl font-bold text-white pointer-events-none select-none">
                {tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0}%
            </div>

            <h3 className="text-xl font-bold text-white mb-6 relative z-10 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Personalized Plan
            </h3>

            <div className="space-y-4 relative z-10 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {tasks.map((task) => (
                    <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-start space-x-4 p-4 rounded-xl border transition-all duration-300 ${completed.includes(task.id) ? "bg-green-500/10 border-green-500/20" : "bg-white/5 border-white/5 hover:border-white/10"}`}
                    >
                        <Checkbox
                            id={`task-${task.id}`}
                            checked={completed.includes(task.id)}
                            onCheckedChange={() => toggleTask(task.id)}
                            className="mt-1 border-white/20 data-[state=checked]:bg-green-500 data-[state=checked]:text-black"
                        />
                        <div className="flex-1">
                            <Label
                                htmlFor={`task-${task.id}`}
                                className={`text-sm font-bold cursor-pointer transition-colors ${completed.includes(task.id) ? "text-green-400 line-through decoration-green-500/50" : "text-white"}`}
                            >
                                {task.title}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>

                            {/* Resources */}
                            {task.resources && (
                                <div className="mt-3 flex gap-2">
                                    <span className="text-[10px] items-center flex gap-1 px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                                        <ExternalLink className="h-2 w-2" /> Learning Resource
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
