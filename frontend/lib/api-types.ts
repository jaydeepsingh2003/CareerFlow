/**
 * KodNestCareers API Contract Types
 * Shared between Frontend and Backend
 */

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    meta?: {
        total?: number;
        page?: number;
    };
}

export interface User {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN' | 'RECRUITER';
    firstName?: string;
    lastName?: string;
}

export interface Profile {
    id: string;
    userId: string;
    firstName: string;
    lastName: string;
    headline?: string;
    bio?: string;
    location?: string;
    skills: Skill[];
}

export interface Skill {
    id: string;
    name: string;
    level: number;
}

export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    status: 'OPEN' | 'CLOSED';
    matchScore?: number;
    matchBreakdown?: {
        ai: number;
        skills: number;
        recency: number;
        completeness: number;
    };
    requirements?: string[];
    createdAt: string;
    description: string;
    type?: string;
    salary?: string;
}

export interface ReadinessPlan {
    id: string;
    userId: string;
    jobId: string;
    tasks: PrepTask[];
    generatedAt: string;
}

export interface PrepTask {
    id: string;
    title: string;
    description: string;
    order: number;
    isCompleted: boolean;
    resources: string[]; // Parsed from JSON
}

export interface ATSAssessment {
    id: string;
    resumeId: string;
    overallScore: number;
    skillOverlap?: number;
    similarityScore?: number;
    quantificationScore?: number;
    keywordsMatched: string; // JSON string
    missingKeywords: string; // JSON string
    suggestions?: string;    // JSON string
    confidence?: number;
    summary: string;
    createdAt: string;
}

export interface Resume {
    id: string;
    userId: string;
    title: string;
    textContent: string;
    status: string;
    assessment?: ATSAssessment;
    createdAt: string;
}

export interface Application {
    id: string;
    userId: string;
    jobId: string;
    status: ApplicationStatus;
    score: number;
    job: Job;
    createdAt: string;
    updatedAt: string;
}

export type ApplicationStatus = 'SAVED' | 'APPLIED' | 'INTERVIEWING' | 'OFFER' | 'REJECTED'; 
