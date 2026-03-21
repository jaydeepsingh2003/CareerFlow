"use client";

import { ResumeData, TemplateId } from "@/lib/resume-types";
import { cn } from "@/lib/utils";

interface ResumePreviewProps {
    data: ResumeData;
    template: TemplateId;
    className?: string;
}

/**
 * PERFECTED RESUME RENDERER
 * Designed for A4 high-fidelity output (210mm x 297mm)
 */
export function ResumePreview({ data, template, className }: ResumePreviewProps) {
    const pi = data.personalInfo;
    const hasContent = pi.fullName || data.experiences.length > 0 || data.education.length > 0;

    if (!hasContent) {
        return (
            <div className={cn("bg-white text-gray-400 flex flex-col items-center justify-center rounded-2xl shadow-inner border-2 border-dashed border-gray-100", className)} style={{ aspectRatio: '1/1.414', minHeight: 600 }}>
                <div className="text-center space-y-4 max-w-xs">
                    <div className="h-20 w-20 rounded-3xl bg-gray-50 flex items-center justify-center mx-auto text-gray-200">
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-500 tracking-tight">Preview Architecture</p>
                        <p className="text-sm text-gray-400 font-light">Your professional identity will be rendered here in real-time as you inject metadata.</p>
                    </div>
                </div>
            </div>
        );
    }

    const templateConfigs: Record<TemplateId, any> = {
        executive: {
            wrapper: "font-['Inter',sans-serif] text-slate-800",
            header: "border-b-4 border-slate-900 pb-6 mb-8",
            name: "text-[32px] font-black uppercase tracking-tight text-slate-900 leading-none",
            contact: "text-[10px] uppercase tracking-widest text-slate-500 mt-3 font-bold",
            sectionTitle: "text-[14px] font-black uppercase tracking-[0.2em] text-slate-900 border-b border-slate-200 pb-1 mb-4 flex items-center gap-3",
            bullet: "bg-slate-900",
            bodyText: "text-[10.5px] leading-[1.6] text-slate-700",
            accent: "bg-slate-900"
        },
        modern: {
            wrapper: "font-['Inter',sans-serif] text-slate-700",
            header: "bg-slate-900 text-white -mx-8 -mt-8 px-10 pt-10 pb-8 mb-8 relative overflow-hidden",
            name: "text-[28px] font-bold text-white relative z-10",
            contact: "text-[11px] text-slate-300 mt-2 flex flex-wrap gap-x-4 gap-y-1 relative z-10",
            sectionTitle: "text-[13px] font-bold uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2 after:content-[''] after:h-[1px] after:flex-1 after:bg-blue-100",
            bullet: "bg-blue-500",
            bodyText: "text-[11px] leading-[1.6] text-slate-600",
            accent: "bg-blue-600"
        },
        minimal: {
            wrapper: "font-['Inter',sans-serif] text-gray-700",
            header: "mb-10 text-center",
            name: "text-[36px] font-light tracking-[0.1em] text-gray-900 mb-2",
            contact: "text-[10px] uppercase tracking-widest text-gray-400 space-x-3",
            sectionTitle: "text-[12px] font-semibold uppercase tracking-[0.3em] text-gray-400 mb-6 flex justify-center",
            bullet: "bg-gray-300",
            bodyText: "text-[11px] leading-[1.7] text-gray-600",
            accent: "bg-gray-900"
        },
        creative: {
            wrapper: "font-['Poppins',sans-serif] text-slate-800",
            header: "bg-gradient-to-br from-purple-600 to-pink-600 text-white -mx-8 -mt-8 px-8 py-10 mb-8 rounded-b-[3rem]",
            name: "text-[32px] font-black tracking-tight",
            contact: "text-[11px] text-purple-100 mt-2 opacity-80",
            sectionTitle: "text-[15px] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-4",
            bullet: "bg-pink-500",
            bodyText: "text-[11px] leading-[1.6] text-slate-600",
            accent: "bg-gradient-to-r from-purple-600 to-pink-600"
        },
        developer: {
            wrapper: "font-['JetBrains_Mono','monospace'] text-gray-800",
            header: "border-l-4 border-emerald-500 pl-6 py-4 mb-8",
            name: "text-[26px] font-bold text-gray-900",
            contact: "text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-tighter",
            sectionTitle: "text-[14px] font-bold text-emerald-700 mb-4 font-mono before:content-['#_']",
            bullet: "bg-emerald-500",
            bodyText: "text-[11px] leading-[1.6] text-gray-600",
            accent: "bg-emerald-500"
        }
    };

    const config = templateConfigs[template];

    return (
        <div
            id="resume-preview-content"
            className={cn(
                "bg-white shadow-2xl relative",
                config.wrapper,
                className
            )}
            style={{ 
                width: '100%',
                aspectRatio: '210/297',
                padding: template === 'minimal' ? '60px 80px' : '40px 40px' 
            }}
        >
            {/* Template-Specific Decorations */}
            {template === 'modern' && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            )}

            <div className="space-y-6">
                {/* Header */}
                <div className={config.header}>
                    <h1 className={config.name}>{pi.fullName || 'IDENTITY_PENDING'}</h1>
                    <div className={config.contact}>
                        {[pi.email, pi.phone, pi.location, pi.linkedin, pi.github].filter(Boolean).map((t, i) => (
                           <span key={i} className="flex-shrink-0">
                               {t}{i < [pi.email, pi.phone, pi.location, pi.linkedin, pi.github].filter(Boolean).length - 1 && (
                                   <span className="mx-2 opacity-30">•</span>
                               )}
                           </span>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                {pi.summary && (
                    <div className="space-y-2">
                        <h3 className={config.sectionTitle}>Profile Sequence</h3>
                        <p className={config.bodyText}>{pi.summary}</p>
                    </div>
                )}

                {/* Experience */}
                {data.experiences.length > 0 && (
                    <div className="space-y-4">
                        <h3 className={config.sectionTitle}>Experience Archive</h3>
                        <div className="space-y-5">
                            {data.experiences.map((exp) => (
                                <div key={exp.id} className="space-y-1">
                                    <div className="flex justify-between items-baseline">
                                        <div className="font-bold text-[12.5px] text-slate-900">{exp.jobTitle}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter shrink-0 ml-4">
                                            {exp.startDate}{exp.startDate && ' — '}{exp.isCurrent ? 'Present' : exp.endDate}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-baseline">
                                        <div className="text-[11px] font-medium text-slate-500 italic">{exp.company}{exp.location && ` • ${exp.location}`}</div>
                                    </div>
                                    {exp.bullets.filter(b => b.trim()).length > 0 && (
                                        <ul className="mt-2 space-y-1.5 pl-1">
                                            {exp.bullets.filter(b => b.trim()).map((b, i) => (
                                                <li key={i} className="flex gap-3">
                                                    <span className={cn("mt-[6px] h-1.5 w-1.5 rounded-[0.2em] shrink-0", config.bullet)} />
                                                    <span className={config.bodyText}>{b}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Education */}
                {data.education.length > 0 && (
                    <div className="space-y-3">
                        <h3 className={config.sectionTitle}>Academic History</h3>
                        <div className="space-y-3">
                            {data.education.map((edu) => (
                                <div key={edu.id} className="flex justify-between items-start">
                                    <div className="space-y-0.5">
                                        <div className="font-bold text-[12px] text-slate-900">{edu.degree}{edu.major ? ` in ${edu.major}` : ''}</div>
                                        <div className="text-[11px] text-slate-500">{edu.institution} {edu.gpa && ` • GPA: ${edu.gpa}`}</div>
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter shrink-0 ml-4">{edu.graduationDate}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Skills Grid */}
                {data.skills.some(c => c.skills.length > 0) && (
                    <div className="space-y-3">
                        <h3 className={config.sectionTitle}>Neural Skill Map</h3>
                        <div className="grid grid-cols-1 gap-2">
                            {data.skills.filter(c => c.skills.length > 0).map((cat) => (
                                <div key={cat.id} className="flex gap-2 items-baseline">
                                    <span className="text-[10.5px] font-black uppercase text-slate-400 tracking-tighter w-24 shrink-0">{cat.category}</span>
                                    <span className={cn(config.bodyText, "flex-1")}>{cat.skills.join(' • ')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                 {/* Projects */}
                 {data.projects.length > 0 && (
                    <div className="space-y-3">
                        <h3 className={config.sectionTitle}>Deployed Repositories</h3>
                        <div className="space-y-4">
                            {data.projects.map((proj) => (
                                <div key={proj.id} className="space-y-1">
                                    <div className="flex justify-between items-baseline">
                                        <div className="font-bold text-[12px] text-slate-900">{proj.name}</div>
                                        <div className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 rounded">{proj.technologies.join(', ')}</div>
                                    </div>
                                    {proj.description && <p className={cn(config.bodyText, "italic opacity-80")}>{proj.description}</p>}
                                    {proj.bullets.filter(b => b.trim()).length > 0 && (
                                        <ul className="mt-1 space-y-1 pl-1">
                                            {proj.bullets.filter(b => b.trim()).map((b, i) => (
                                                <li key={i} className="flex gap-3">
                                                    <span className={cn("mt-[6px] h-1 w-2 rounded-full shrink-0", config.bullet)} />
                                                    <span className={config.bodyText}>{b}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Certifications & Achievements Grouped Mini-Section */}
                {(data.certifications.length > 0 || data.achievements.length > 0) && (
                    <div className="grid grid-cols-2 gap-8">
                        {data.certifications.length > 0 && (
                            <div className="space-y-3">
                                <h3 className={config.sectionTitle}>Certification</h3>
                                <div className="space-y-2">
                                    {data.certifications.map(c => (
                                        <div key={c.id} className="text-[10.5px]">
                                            <div className="font-bold text-slate-800">{c.name}</div>
                                            <div className="text-slate-500 font-medium">{c.issuer} • {c.date}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {data.achievements.length > 0 && (
                            <div className="space-y-3">
                                <h3 className={config.sectionTitle}>Distinctions</h3>
                                <div className="space-y-2">
                                    {data.achievements.map(a => (
                                        <div key={a.id} className="text-[10.5px]">
                                            <div className="font-bold text-slate-800">{a.title}</div>
                                            <div className="text-slate-500">{a.description}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Print Margin Simulation (A4) */}
            <div className="absolute bottom-4 left-4 text-[7px] text-gray-200 font-mono hidden print:block">
                GENERATED VIA KODNEST INTELLIGENCE // SECURE_ID: {crypto.randomUUID().slice(0, 8)}
            </div>
        </div>
    );
}
