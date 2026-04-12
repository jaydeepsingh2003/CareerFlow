import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    ResumeData,
    TemplateId,
    WizardStep,
    AISuggestion,
    Experience,
    Education,
    Project,
    SkillCategory,
    PersonalInfo,
    Certification,
    Achievement,
    getDefaultResumeData,
} from './resume-types';

interface ResumeStore {
    // State
    resumeData: ResumeData;
    activeStep: WizardStep;
    selectedTemplate: TemplateId;
    aiSuggestions: AISuggestion[];
    isGenerating: boolean;
    isDirty: boolean;

    // Navigation
    setActiveStep: (step: WizardStep) => void;
    nextStep: () => void;
    prevStep: () => void;

    // Template
    setTemplate: (template: TemplateId) => void;

    // Personal Info
    updatePersonalInfo: (field: keyof PersonalInfo, value: string) => void;

    // Experience
    addExperience: () => void;
    updateExperience: (id: string, field: keyof Experience, value: any) => void;
    removeExperience: (id: string) => void;
    addBullet: (expId: string) => void;
    updateBullet: (expId: string, index: number, value: string) => void;
    removeBullet: (expId: string, index: number) => void;

    // Education
    addEducation: () => void;
    updateEducation: (id: string, field: keyof Education, value: any) => void;
    removeEducation: (id: string) => void;

    // Skills
    addSkillCategory: () => void;
    updateSkillCategoryName: (id: string, name: string) => void;
    removeSkillCategory: (id: string) => void;
    addSkill: (categoryId: string, skill: string) => void;
    removeSkill: (categoryId: string, skill: string) => void;

    // Projects
    addProject: () => void;
    updateProject: (id: string, field: keyof Project, value: any) => void;
    removeProject: (id: string) => void;
    addProjectBullet: (projectId: string) => void;
    updateProjectBullet: (projectId: string, index: number, value: string) => void;
    removeProjectBullet: (projectId: string, index: number) => void;
    addProjectTech: (projectId: string, tech: string) => void;
    removeProjectTech: (projectId: string, index: number) => void;

    // Certifications
    addCertification: () => void;
    updateCertification: (id: string, field: keyof Certification, value: any) => void;
    removeCertification: (id: string) => void;

    // Achievements
    addAchievement: () => void;
    updateAchievement: (id: string, field: keyof Achievement, value: any) => void;
    removeAchievement: (id: string) => void;

    // AI
    setAISuggestions: (suggestions: AISuggestion[]) => void;
    applySuggestion: (id: string) => void;
    dismissSuggestion: (id: string) => void;
    setIsGenerating: (v: boolean) => void;

    // Reset
    resetResume: () => void;
    loadResume: (data: ResumeData) => void;
}

const STEP_ORDER: WizardStep[] = ['personal', 'experience', 'education', 'skills', 'projects', 'certifications', 'achievements', 'template', 'preview'];

export const useResumeStore = create<ResumeStore>()(
    persist(
        (set) => ({
            resumeData: getDefaultResumeData(),
            activeStep: 'personal',
            selectedTemplate: 'executive',
            aiSuggestions: [],
            isGenerating: false,
            isDirty: false,

            setActiveStep: (step) => set({ activeStep: step }),
            nextStep: () => set((s) => {
                const idx = STEP_ORDER.indexOf(s.activeStep);
                if (idx < STEP_ORDER.length - 1) return { activeStep: STEP_ORDER[idx + 1] };
                return {};
            }),
            prevStep: () => set((s) => {
                const idx = STEP_ORDER.indexOf(s.activeStep);
                if (idx > 0) return { activeStep: STEP_ORDER[idx - 1] };
                return {};
            }),

            setTemplate: (template) => set({ selectedTemplate: template }),

            updatePersonalInfo: (field, value) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        personalInfo: { ...s.resumeData.personalInfo, [field]: value },
                    },
                })),

            addExperience: () =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        experiences: [
                            ...s.resumeData.experiences,
                            {
                                id: crypto.randomUUID(),
                                jobTitle: '',
                                company: '',
                                location: '',
                                startDate: '',
                                endDate: '',
                                isCurrent: false,
                                bullets: [''],
                            },
                        ],
                    },
                })),

            updateExperience: (id, field, value) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        experiences: s.resumeData.experiences.map((e) =>
                            e.id === id ? { ...e, [field]: value } : e
                        ),
                    },
                })),

            removeExperience: (id) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        experiences: s.resumeData.experiences.filter((e) => e.id !== id),
                    },
                })),

            addBullet: (expId) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        experiences: s.resumeData.experiences.map((e) =>
                            e.id === expId ? { ...e, bullets: [...e.bullets, ''] } : e
                        ),
                    },
                })),

            updateBullet: (expId, index, value) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        experiences: s.resumeData.experiences.map((e) =>
                            e.id === expId
                                ? { ...e, bullets: e.bullets.map((b, i) => (i === index ? value : b)) }
                                : e
                        ),
                    },
                })),

            removeBullet: (expId, index) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        experiences: s.resumeData.experiences.map((e) =>
                            e.id === expId
                                ? { ...e, bullets: e.bullets.filter((_, i) => i !== index) }
                                : e
                        ),
                    },
                })),

            addEducation: () =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        education: [
                            ...s.resumeData.education,
                            {
                                id: crypto.randomUUID(),
                                degree: '',
                                institution: '',
                                major: '',
                                graduationDate: '',
                                gpa: '',
                                honors: [],
                            },
                        ],
                    },
                })),

            updateEducation: (id, field, value) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        education: s.resumeData.education.map((e) =>
                            e.id === id ? { ...e, [field]: value } : e
                        ),
                    },
                })),

            removeEducation: (id) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        education: s.resumeData.education.filter((e) => e.id !== id),
                    },
                })),

            addSkillCategory: () =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        skills: [
                            ...s.resumeData.skills,
                            { id: crypto.randomUUID(), category: 'New Category', skills: [] },
                        ],
                    },
                })),

            updateSkillCategoryName: (id, name) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        skills: s.resumeData.skills.map((c) =>
                            c.id === id ? { ...c, category: name } : c
                        ),
                    },
                })),

            removeSkillCategory: (id) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        skills: s.resumeData.skills.filter((c) => c.id !== id),
                    },
                })),

            addSkill: (categoryId, skill) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        skills: s.resumeData.skills.map((c) =>
                            c.id === categoryId
                                ? { ...c, skills: [...c.skills, skill] }
                                : c
                        ),
                    },
                })),

            removeSkill: (categoryId, skill) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        skills: s.resumeData.skills.map((c) =>
                            c.id === categoryId
                                ? { ...c, skills: c.skills.filter((sk) => sk !== skill) }
                                : c
                        ),
                    },
                })),

            addProject: () =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        projects: [
                            ...s.resumeData.projects,
                            {
                                id: crypto.randomUUID(),
                                name: '',
                                description: '',
                                technologies: [],
                                liveUrl: '',
                                repoUrl: '',
                                bullets: [''],
                            },
                        ],
                    },
                })),

            updateProject: (id, field, value) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        projects: s.resumeData.projects.map((p) =>
                            p.id === id ? { ...p, [field]: value } : p
                        ),
                    },
                })),

            removeProject: (id) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        projects: s.resumeData.projects.filter((p) => p.id !== id),
                    },
                })),

            addProjectBullet: (projectId) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        projects: s.resumeData.projects.map((p) =>
                            p.id === projectId ? { ...p, bullets: [...p.bullets, ''] } : p
                        ),
                    },
                })),

            updateProjectBullet: (projectId, index, value) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        projects: s.resumeData.projects.map((p) =>
                            p.id === projectId
                                ? { ...p, bullets: p.bullets.map((b, i) => (i === index ? value : b)) }
                                : p
                        ),
                    },
                })),

            removeProjectBullet: (projectId, index) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        projects: s.resumeData.projects.map((p) =>
                            p.id === projectId
                                ? { ...p, bullets: p.bullets.filter((_, i) => i !== index) }
                                : p
                        ),
                    },
                })),

            addProjectTech: (projectId, tech) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        projects: s.resumeData.projects.map((p) =>
                            p.id === projectId ? { ...p, technologies: [...p.technologies, tech] } : p
                        ),
                    },
                })),

            removeProjectTech: (projectId, index) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        projects: s.resumeData.projects.map((p) =>
                            p.id === projectId
                                ? { ...p, technologies: p.technologies.filter((_, i) => i !== index) }
                                : p
                        ),
                    },
                })),

            addCertification: () =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        certifications: [
                            ...s.resumeData.certifications,
                            {
                                id: crypto.randomUUID(),
                                name: '',
                                issuer: '',
                                date: '',
                                credentialUrl: '',
                            },
                        ],
                    },
                })),

            updateCertification: (id, field, value) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        certifications: s.resumeData.certifications.map((c) =>
                            c.id === id ? { ...c, [field]: value } : c
                        ),
                    },
                })),

            removeCertification: (id) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        certifications: s.resumeData.certifications.filter((c) => c.id !== id),
                    },
                })),

            addAchievement: () =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        achievements: [
                            ...s.resumeData.achievements,
                            {
                                id: crypto.randomUUID(),
                                title: '',
                                description: '',
                                date: '',
                            },
                        ],
                    },
                })),

            updateAchievement: (id, field, value) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        achievements: s.resumeData.achievements.map((a) =>
                            a.id === id ? { ...a, [field]: value } : a
                        ),
                    },
                })),

            removeAchievement: (id) =>
                set((s) => ({
                    isDirty: true,
                    resumeData: {
                        ...s.resumeData,
                        achievements: s.resumeData.achievements.filter((a) => a.id !== id),
                    },
                })),

            setAISuggestions: (suggestions) => set({ aiSuggestions: suggestions }),
            applySuggestion: (id) =>
                set((s) => {
                    const suggestion = s.aiSuggestions.find(sg => sg.id === id);
                    if (!suggestion) return {};

                    let newResumeData = { ...s.resumeData };

                    if (suggestion.section === 'personalInfo' && suggestion.type === 'summary') {
                        newResumeData.personalInfo.summary = suggestion.suggested;
                    } else if (suggestion.section === 'experiences' && suggestion.targetId && suggestion.index !== undefined) {
                        newResumeData.experiences = newResumeData.experiences.map(exp => 
                            exp.id === suggestion.targetId 
                                ? { ...exp, bullets: exp.bullets.map((b, i) => i === suggestion.index ? suggestion.suggested : b) }
                                : exp
                        );
                    } else if (suggestion.section === 'projects' && suggestion.targetId && suggestion.index !== undefined) {
                        newResumeData.projects = newResumeData.projects.map(proj => 
                            proj.id === suggestion.targetId 
                                ? { ...proj, bullets: proj.bullets.map((b, i) => i === suggestion.index ? suggestion.suggested : b) }
                                : proj
                        );
                    }

                    return {
                        resumeData: newResumeData,
                        aiSuggestions: s.aiSuggestions.filter((sg) => sg.id !== id),
                    };
                }),
            dismissSuggestion: (id) =>
                set((s) => ({
                    aiSuggestions: s.aiSuggestions.filter((sg) => sg.id !== id),
                })),
            setIsGenerating: (v) => set({ isGenerating: v }),

            resetResume: () => set({ resumeData: getDefaultResumeData(), isDirty: false, aiSuggestions: [], activeStep: 'personal' }),
            loadResume: (data) => set({ resumeData: data, isDirty: false }),
        }),
        {
            name: 'kodnest-resume',
        }
    )
);
