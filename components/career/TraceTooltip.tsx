"use client";

import { Info, Sparkles, Brain, Cpu, Target } from "lucide-react";
import { 
    Tooltip, 
    TooltipContent, 
    TooltipProvider, 
    TooltipTrigger 
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TraceTooltipProps {
    reason: string;
    engine?: 'Qwen' | 'Llama' | 'Deterministic';
    label?: string;
    className?: string;
    children?: React.ReactNode;
}

export function TraceTooltip({ reason, engine = 'Deterministic', label = 'Cognitive Trace', className, children }: TraceTooltipProps) {
    const EngineIcon = engine === 'Qwen' ? Brain : engine === 'Llama' ? Sparkles : Cpu;

    return (
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn("cursor-help inline-flex items-center gap-1.5", className)}>
                        {children || <Info className="h-3 w-3 text-muted-foreground opacity-50" />}
                    </div>
                </TooltipTrigger>
                <TooltipContent 
                    side="top" 
                    className="p-4 rounded-2xl bg-[#0F0F1A] border border-white/5 shadow-2xl max-w-[300px] animate-in zoom-in-95"
                >
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <EngineIcon className={cn(
                                    "h-3 w-3", 
                                    engine === 'Qwen' ? "text-primary" : engine === 'Llama' ? "text-purple-400" : "text-emerald-400"
                                )} />
                                {label}
                            </h4>
                            <span className="text-[8px] font-mono text-muted-foreground uppercase opacity-60">Engine: {engine}</span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed font-light">
                            {reason}
                        </p>
                        {engine !== 'Deterministic' && (
                            <div className="flex items-center gap-1.5 text-[8px] font-bold text-emerald-500 uppercase tracking-tighter">
                                <Target className="h-2.5 w-2.5" /> High Probablity Decision
                            </div>
                        )}
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
