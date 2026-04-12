"use client";

import { useResumeStore } from "@/lib/resume-store";
import { WIZARD_STEPS, WizardStep } from "@/lib/resume-types";
import { PersonalInfoEditor } from "@/components/resume/editors/PersonalInfoEditor";
import { ExperienceEditor } from "@/components/resume/editors/ExperienceEditor";
import { EducationEditor } from "@/components/resume/editors/EducationEditor";
import { SkillsEditor } from "@/components/resume/editors/SkillsEditor";
import { ProjectsEditor } from "@/components/resume/editors/ProjectsEditor";
import { CertificationsEditor, AchievementsEditor } from "@/components/resume/editors/CertAchievementEditor";
import { TemplateSelector } from "@/components/resume/TemplateSelector";
import { ResumePreview } from "@/components/resume/ResumePreview";
import { AISuggestions } from "@/components/resume/AISuggestions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, FileDown, Eye, Save, Sparkles, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";

// Helper component that forces an A4 (794x1123) container to scale down visually based on its parent's width 
// This completely fixes mobile overflow for Pixel-Perfect rendering.
function ScaleWrapper({ children }: { children: React.ReactNode }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const obs = new ResizeObserver((entries) => {
            if (entries[0]) {
                const width = entries[0].contentRect.width;
                // 794px is the exact width of an A4 paper at 96 DPI
                setScale(width / 794);
            }
        });
        if (containerRef.current) obs.observe(containerRef.current);
        return () => obs.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="w-full overflow-hidden rounded-xl" style={{ height: 1123 * scale }}>
            <div style={{ width: '794px', height: '1123px', transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                {children}
            </div>
        </div>
    );
}


export default function ResumeBuilderPage() {
    const { 
        activeStep, setActiveStep, nextStep, prevStep, 
        resumeData, selectedTemplate, isGenerating, setIsGenerating,
        setAISuggestions
    } = useResumeStore();
    
    const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
    const resumeRef = useRef<HTMLDivElement>(null);

    const stepOrder = WIZARD_STEPS.map(s => s.key);
    const activeIdx = stepOrder.indexOf(activeStep);
    
    const renderEditor = () => {
        switch (activeStep) {
            case 'personal': return <PersonalInfoEditor />;
            case 'experience': return <ExperienceEditor />;
            case 'education': return <EducationEditor />;
            case 'skills': return <SkillsEditor />;
            case 'projects': return <ProjectsEditor />;
            case 'certifications': return <CertificationsEditor />;
            case 'achievements': return <AchievementsEditor />;
            case 'template': return <TemplateSelector />;
            case 'preview': return (
                <div className="space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-white flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <Eye className="h-6 w-6 text-white" />
                                </div>
                                Final Review
                            </h2>
                            <p className="text-muted-foreground ml-[64px] text-sm leading-relaxed">
                                Review your professional resume. Optimized for a perfect A4 download.
                            </p>
                        </div>
                        <Button 
                            onClick={handlePrint}
                            className="bg-primary hover:bg-primary/90 text-white gap-3 h-14 px-8 rounded-2xl font-black shadow-xl shadow-primary/20"
                        >
                            <FileDown className="h-5 w-5" /> Download Resume
                        </Button>
                    </div>

                    <div className="flex justify-center bg-black/40 p-4 md:p-12 rounded-[3.5rem] border border-white/5 shadow-inner">
                        <div className="w-full max-w-[800px] shadow-[0_20px_80px_rgba(0,0,0,0.5)]">
                            <ScaleWrapper>
                                <ResumePreview data={resumeData} template={selectedTemplate} />
                            </ScaleWrapper>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 justify-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-40">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        Finalized Metadata Verification Complete
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    </div>
                </div>
            );
            default: return null;
        }
    };

    const handlePrint = async () => {
        const element = document.getElementById('resume-preview-content');
        if (!element) return;

        toast.loading("Initializing high-fidelity PDF render...", { id: 'pdf-gen' });
        
        try {
            const html2canvas = (await import('html2canvas')).default;
            const jsPDF = (await import('jspdf')).jsPDF;

            // Render to canvas with high scale for crisp text
            const canvas = await html2canvas(element, {
                scale: 3,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 794, // Standard A4 at 96 DPI
                onclone: (doc) => {
                    // Ensure the cloned element is visible even if parent is hidden
                    const cloned = doc.getElementById('resume-preview-content');
                    if (cloned) {
                        cloned.style.visibility = 'visible';
                        cloned.style.position = 'static';
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Resume_${resumeData.personalInfo.fullName.replace(/\s+/g, '_') || 'Profile'}.pdf`);
            
            toast.success("PDF Protocol Exported Successfully", { id: 'pdf-gen' });
        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error("PDF Engine Failure. Reverting to print protocol...", { id: 'pdf-gen' });
            window.print();
        }
    };

    const handleGenerateAI = async () => {
        if (!resumeData.personalInfo.summary && resumeData.experiences.length === 0) {
            toast.error("Add content before starting Neural Optimization");
            return;
        }

        setIsGenerating(true);
        toast.loading("Analyzing neural technical profile...", { id: 'ai-gen' });
        
        // Simulating AI analysis delay
        setTimeout(() => {
            const suggestions = [
                {
                    id: 'bullet_1',
                    type: 'bullet' as const,
                    section: 'experiences' as const,
                    targetId: resumeData.experiences[0]?.id || 'fake_id',
                    index: 0,
                    original: resumeData.experiences[0]?.bullets[0] || 'Worked on React components.',
                    suggested: 'Architected modular React component library for the core landing platform, reducing style-debt by 40% and increasing rendering performance by 25ms.',
                    reason: 'Your original point lacks quantification and impact metrics. The suggested version uses stronger action verbs and highlights measurable results.'
                },
                {
                    id: 'summary_1',
                    type: 'summary' as const,
                    section: 'personalInfo' as const,
                    original: resumeData.personalInfo.summary || 'Software engineer looking for new roles.',
                    suggested: 'Solution-oriented Senior Software Architect with 8+ years of expertise in distributed systems and high-scale cloud infrastructure. Specialized in high-performance Node applications and predictive AI models.',
                    reason: 'The summary should be a high-impact branding statement, not a general search description.'
                }
            ];
            setAISuggestions(suggestions);
            setIsGenerating(false);
            toast.success("Optimization Vector Found: 2 Improvements Identified", { id: 'ai-gen' });
        }, 2000);
    };

    return (
        <div className="min-h-full pb-20">
            {/* Header / Info Section */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                            v4.1.2 Deployment Environment
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">CAREERFLOW <span className="text-primary italic">RESUME</span></h1>
                    <p className="text-muted-foreground text-sm max-w-xl">
                        Design your professional resume with our easy-to-use editor. Perfect for any job application.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button 
                        variant="outline" 
                        size="lg" 
                        onClick={handleGenerateAI}
                        disabled={isGenerating}
                        className="h-12 px-6 border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 text-purple-400 rounded-2xl gap-2 transition-all hover:scale-105"
                    >
                        <Sparkles className={cn("h-5 w-5", isGenerating && "animate-spin")} />
                        Get Smart Suggestions
                    </Button>
                    <Button 
                        variant="outline"
                        size="lg"
                        className="h-12 px-6 border-white/5 bg-white/5 hover:bg-white/10 text-white rounded-2xl gap-2"
                    >
                        <Save className="h-5 w-5" /> Save Changes
                    </Button>
                </div>
            </div>

            {/* Main Content Layout - Split View for Max Efficiency */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                
                {/* Left Side: Stepper + Editor */}
                <div className="space-y-6">
                    <div className="glass-panel p-4 rounded-[2rem] border border-white/5 shadow-xl bg-white/[0.02]">
                        <div className="flex gap-1 overflow-x-auto no-scrollbar p-1">
                            {WIZARD_STEPS.map((step, i) => {
                                const isActive = activeStep === step.key;
                                return (
                                    <button
                                        key={step.key}
                                        onClick={() => setActiveStep(step.key)}
                                        className={cn(
                                            "flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all min-w-[85px] group relative shrink-0",
                                            isActive 
                                                ? "bg-primary/20 text-white" 
                                                : "hover:bg-white/5 text-muted-foreground hover:text-white"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-10 w-10 flex items-center justify-center rounded-xl font-bold text-lg transition-all shadow-inner",
                                            isActive ? "bg-primary text-white scale-110 shadow-primary/20" : "bg-white/5 border border-white/5"
                                        )}>
                                            {step.icon}
                                        </div>
                                        <span className={cn(
                                            "text-[9px] font-black uppercase tracking-tighter transition-colors",
                                            isActive ? "text-white" : "text-muted-foreground"
                                        )}>
                                            {step.label}
                                        </span>
                                        {isActive && (
                                            <motion.div layoutId="step-indicator" className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="glass-panel p-8 rounded-[3rem] border border-white/5 min-h-[700px] flex flex-col shadow-2xl relative overflow-hidden bg-black/40">
                        {/* Decorative background for the editor */}
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />

                        <div className="flex-1 relative z-10">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeStep}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {renderEditor()}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        
                        <div className="mt-12 flex items-center justify-between pt-8 border-t border-white/5 px-2 relative z-10">
                            <Button 
                                variant="ghost" 
                                size="lg" 
                                disabled={activeIdx === 0}
                                onClick={prevStep}
                                className="text-muted-foreground hover:text-white h-12 px-6 hover:bg-white/5 rounded-2xl gap-2 font-medium"
                            >
                                <ChevronLeft className="h-5 w-5" /> Previous
                            </Button>
                            
                            <Button 
                                size="lg" 
                                onClick={activeIdx === WIZARD_STEPS.length - 1 ? handlePrint : nextStep}
                                className="h-14 px-10 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl gap-3 transition-all hover:translate-x-1 active:scale-95 shadow-[0_15px_40px_rgba(124,58,237,0.4)]"
                            >
                                {activeIdx === WIZARD_STEPS.length - 1 ? (
                                    <>Finalize & Print <Printer className="h-5 w-5" /></>
                                ) : (
                                    <>Continue <ChevronRight className="h-5 w-5" /></>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Massive High-Fidelity Preview */}
                <div className="xl:sticky xl:top-6 space-y-6 h-full">
                    <div className="glass-panel p-6 rounded-[3.5rem] border border-white/5 bg-black/60 shadow-2xl overflow-hidden min-h-[850px] relative">
                        <div className="flex items-center justify-between mb-6 px-4">
                            <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-3">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                                High-Fidelity A4 Render
                            </h2>
                            <Badge variant="outline" className="text-[9px] border-primary/20 bg-primary/5 text-primary font-black uppercase tracking-widest">
                                REAL-TIME SYNC ACTIVE
                            </Badge>
                        </div>
                        
                        <div className="flex justify-center p-4">
                            <div className="w-full max-w-[700px] shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
                                <ScaleWrapper>
                                    <ResumePreview 
                                        data={resumeData} 
                                        template={selectedTemplate} 
                                        className="rounded-sm"
                                    />
                                </ScaleWrapper>
                            </div>
                        </div>
                        
                        {/* Ambient Overlays */}
                        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full px-12">
                            <div className="p-1 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl flex items-center gap-4 px-6 py-4 shadow-3xl">
                                <div className="flex flex-col flex-1">
                                    <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Selected Template</span>
                                    <span className="text-sm font-black text-white uppercase italic">{selectedTemplate} Protocol</span>
                                </div>
                                <div className="h-10 w-px bg-white/10" />
                                <Button 
                                    onClick={handlePrint}
                                    className="bg-white text-black hover:bg-neutral-200 h-11 px-8 rounded-2xl font-black italic tracking-tighter"
                                >
                                    GET PDF <FileDown className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 0;
                        size: A4;
                    }
                    body * {
                        visibility: hidden !important;
                    }
                    #resume-preview-content, #resume-preview-content * {
                        visibility: visible !important;
                    }
                    #resume-preview-content {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 210mm !important;
                        height: 297mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        transform: none !important;
                        z-index: 9999 !important;
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    /* Ensure text inside inputs/textareas is visible in print */
                    .print-visible-field {
                        background: transparent !important;
                        border: none !important;
                        color: black !important;
                        padding: 0 !important;
                        height: auto !important;
                        min-height: auto !important;
                        box-shadow: none !important;
                        overflow: visible !important;
                    }
                }
            `}</style>
        </div>
    );
}
