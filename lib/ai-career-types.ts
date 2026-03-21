"use client";

// --- AI INTERVIEW TYPES ---

export type AssessmentSkill = {
    name: string;
    score: number; // 0-1
};

export type AssessmentResult = {
    skills: AssessmentSkill[];
    domain: string;
    confidence: number; // 0-1
};

export type InterviewQuestion = {
    id: string;
    text: string;
    type: 'initial' | 'adaptive' | 'final';
    detectedSkills: string[];
};

// --- SIMULATION TYPES ---

export type SimulationTask = {
    id: string;
    title: string;
    description: string;
    scenario: string;
    constraints: string[];
    expectedOutcome: string;
    difficulty: 'junior' | 'mid' | 'senior';
};

export type SimulationResult = {
    taskId: string;
    correctness: number; // 0-1
    timeTaken: number; // in seconds
    attempts: number;
    score: number; // calculated deterministicly
};

// --- SKILL FUSION & GRAPH TYPES ---

export type SkillProficiency = {
    skillId: string;
    name: string;
    interviewScore: number;
    simulationScore: number;
    finalScore: number; // 0.6 * interview + 0.4 * simulation
    lastUpdated: Date;
    evidence: {
        reasoning: string; // "Why this score was assigned" (Trace)
    };
};

export type SkillDependency = {
    skill: string;
    prerequisites: string[];
};

export type LearningStep = {
    skill: string;
    status: 'pending' | 'in_progress' | 'completed';
    videos: LearningVideo[];
    reason: string; // Reasoning Trace
};

export type LearningPath = {
    userId: string;
    steps: LearningStep[];
    timeConstraint?: {
        days: number;
        hoursPerDay: number;
    };
};

// --- YOUTUBE ENGINE TYPES ---

export type LearningVideo = {
    id: string;
    title: string;
    url: string;
    thumbnail: string;
    channel: string;
    duration: string;
    viewCount: number;
    likeCount: number;
    publishedAt: string;
    score: number; // Result of the Ranking Algorithm
};

// --- JOB MATCHING TYPES ---

export type JobMatchResult = {
    jobId: string;
    matchPercentage: number;
    matchedSkills: string[];
    missingSkills: string[];
    explanation: string; // Reasoning Trace
};

// --- AI RESUME ENHANCEMENT ---

export type ResumeEnhancementMode = 'technical' | 'concise' | 'impact-heavy';

export type EnhancedBullet = {
    original: string;
    enhanced: string;
    explanation: string; // Why it's better
};
