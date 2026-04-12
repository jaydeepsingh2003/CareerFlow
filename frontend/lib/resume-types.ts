/**
 * AI Resume & Portfolio Builder — Type Definitions
 */

export interface PersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    portfolio: string;
    location: string;
    summary: string;
    avatarUrl: string;
}

export interface Experience {
    id: string;
    jobTitle: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    bullets: string[];
}

export interface Education {
    id: string;
    degree: string;
    institution: string;
    major: string;
    graduationDate: string;
    gpa: string;
    honors: string[];
}

export interface Project {
    id: string;
    name: string;
    description: string;
    technologies: string[];
    liveUrl: string;
    repoUrl: string;
    bullets: string[];
}

export interface SkillCategory {
    id: string;
    category: string;
    skills: string[];
}

export interface Certification {
    id: string;
    name: string;
    issuer: string;
    date: string;
    credentialUrl: string;
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    date: string;
}

export interface ResumeData {
    personalInfo: PersonalInfo;
    experiences: Experience[];
    education: Education[];
    skills: SkillCategory[];
    projects: Project[];
    certifications: Certification[];
    achievements: Achievement[];
}

export type TemplateId = 'executive' | 'modern' | 'minimal' | 'creative' | 'developer';

export type WizardStep = 'personal' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'achievements' | 'template' | 'preview';

export const WIZARD_STEPS: { key: WizardStep; label: string; icon: string }[] = [
    { key: 'personal', label: 'Personal', icon: '👤' },
    { key: 'experience', label: 'Experience', icon: '💼' },
    { key: 'education', label: 'Education', icon: '🎓' },
    { key: 'skills', label: 'Skills', icon: '⚡' },
    { key: 'projects', label: 'Projects', icon: '🚀' },
    { key: 'certifications', label: 'Certifications', icon: '📜' },
    { key: 'achievements', label: 'Achievements', icon: '🏆' },
    { key: 'template', label: 'Template', icon: '🎨' },
    { key: 'preview', label: 'Preview', icon: '👁️' },
];

export interface AISuggestion {
    id: string;
    type: 'bullet' | 'summary' | 'skill' | 'section';
    section: 'personalInfo' | 'experiences' | 'projects' | 'education' | 'skills';
    targetId?: string; // ID of the exp, project, etc.
    index?: number;    // index of the bullet
    original: string;
    suggested: string;
    reason: string;
}

export function getDefaultResumeData(): ResumeData {
    return {
        personalInfo: {
            fullName: '',
            email: '',
            phone: '',
            linkedin: '',
            github: '',
            portfolio: '',
            location: '',
            summary: '',
            avatarUrl: '',
        },
        experiences: [],
        education: [],
        skills: [
            { id: crypto.randomUUID(), category: 'Languages', skills: [] },
            { id: crypto.randomUUID(), category: 'Frameworks', skills: [] },
            { id: crypto.randomUUID(), category: 'Tools', skills: [] },
        ],
        projects: [],
        certifications: [],
        achievements: [],
    };
}

// Strong action verbs
export const STRONG_VERBS = [
    'Architected', 'Automated', 'Accelerated', 'Built', 'Consolidated',
    'Delivered', 'Designed', 'Drove', 'Engineered', 'Expanded',
    'Generated', 'Implemented', 'Increased', 'Launched', 'Led',
    'Modernized', 'Optimized', 'Orchestrated', 'Pioneered', 'Reduced',
    'Revamped', 'Scaled', 'Simplified', 'Spearheaded', 'Streamlined',
    'Transformed', 'Upgraded', 'Deployed', 'Integrated', 'Migrated',
];

export const WEAK_VERBS = [
    'worked', 'helped', 'assisted', 'participated', 'was responsible',
    'handled', 'did', 'made', 'used', 'got', 'had', 'went', 'tried',
    'managed to', 'was involved', 'supported', 'contributed to',
];
