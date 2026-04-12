"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
    AssessmentResult, 
    SimulationResult, 
    SkillProficiency, 
    LearningPath, 
    LearningStep,
    SkillDependency,
    LearningVideo
} from './ai-career-types';
import api from './api';

// --- DETERMINISTIC SKILL GRAPH ---
const SKILL_GRAPH: SkillDependency[] = [
    { skill: 'HTML/CSS', prerequisites: [] },
    { skill: 'JavaScript', prerequisites: ['HTML/CSS'] },
    { skill: 'TypeScript', prerequisites: ['JavaScript'] },
    { skill: 'React', prerequisites: ['JavaScript', 'HTML/CSS'] },
    { skill: 'Next.js', prerequisites: ['React', 'TypeScript'] },
    { skill: 'Node.js', prerequisites: ['JavaScript'] },
    { skill: 'Express', prerequisites: ['Node.js'] },
    { skill: 'NestJS', prerequisites: ['Node.js', 'TypeScript'] },
    { skill: 'SQL', prerequisites: [] },
    { skill: 'NoSQL', prerequisites: [] },
    { skill: 'Prisma', prerequisites: ['TypeScript', 'SQL'] },
    { skill: 'PostgreSQL', prerequisites: ['SQL'] },
    { skill: 'System Design', prerequisites: ['Node.js', 'SQL', 'NoSQL'] },
    { skill: 'Docker', prerequisites: ['System Design'] },
    { skill: 'AWS', prerequisites: ['Docker', 'System Design'] },
    { skill: 'Kubernetes', prerequisites: ['Docker', 'AWS'] },
    { skill: 'Python', prerequisites: [] },
    { skill: 'Data Structures', prerequisites: ['JavaScript'] },
    { skill: 'Algorithms', prerequisites: ['Data Structures'] },
    { skill: 'Frontend Architecture', prerequisites: ['React', 'Next.js'] },
];

interface AICareerState {
    // Current User Profile
    userSkills: SkillProficiency[];
    learningPath: LearningPath | null;
    matchedJobs: any[];
    appliedJobs: any[];
    
    // Assessment State
    isAssessing: boolean;
    assessmentSteps: number;
    currentAssessment: AssessmentResult | null;
    
    // Simulation State
    isSimulating: boolean;
    lastSimulation: SimulationResult | null;

    // Actions
    updateSkillScore: (skillId: string, interview: number, simulation: number) => void;
    generateLearningPath: (timeConstraint?: { days: number, hoursPerDay: number }) => void;
    rankVideos: (skill: string, videos: any[]) => LearningVideo[];
    getMatchedJobs: (userId: string) => Promise<void>;
    persistSkills: (userId: string) => Promise<void>;
    
    // API Sync
    syncWithBackend: (userId: string) => Promise<void>;
}

export const useAICareerStore = create<AICareerState>()(
    persist(
        (set, get) => ({
            userSkills: [],
            learningPath: null,
            matchedJobs: [],
            appliedJobs: [],
            isAssessing: false,
            assessmentSteps: 0,
            currentAssessment: null,
            isSimulating: false,
            lastSimulation: null,

            updateSkillScore: (skillId: string, interview: number, simulation: number) => {
                const finalScore = 0.6 * interview + 0.4 * simulation;
                const existing = get().userSkills.find(s => s.skillId === skillId);
                
                const newSkill: SkillProficiency = {
                    skillId,
                    name: skillId, // simplified
                    interviewScore: interview,
                    simulationScore: simulation,
                    finalScore,
                    lastUpdated: new Date(),
                    evidence: {
                        reasoning: `Score derived from Hybrid Assessment. Interview Weight: 0.6 (${interview.toFixed(2)}), Simulation Weight: 0.4 (${simulation.toFixed(2)}).`
                    }
                };

                set(state => ({
                    userSkills: existing 
                        ? state.userSkills.map(s => s.skillId === skillId ? newSkill : s)
                        : [...state.userSkills, newSkill]
                }));

                // Auto-regenerate path if scores changed significantly
                get().generateLearningPath();
            },

            generateLearningPath: (timeConstraint) => {
                const skills = get().userSkills;
                const weakSkills = skills.filter(s => s.finalScore < 0.7).map(s => s.skillId);
                
                // Deterministic Path Generation (Backtracking / Dependency Resolution)
                const resolvedPath: string[] = [];
                const visited = new Set<string>();

                const resolve = (skill: string) => {
                    if (visited.has(skill)) return;
                    
                    const dep = SKILL_GRAPH.find(d => d.skill === skill);
                    if (dep) {
                        dep.prerequisites.forEach(pre => resolve(pre));
                    }
                    
                    // Only add to path if user is actually weak in it or it's a prerequisite of a weak skill
                    // and they haven't mastered it (score < 0.7)
                    const userSkill = skills.find(s => s.skillId === skill);
                    if (!userSkill || userSkill.finalScore < 0.7) {
                        resolvedPath.push(skill);
                    }
                    visited.add(skill);
                };

                weakSkills.forEach(s => resolve(s));

                // Time-constrained compression
                let finalSteps = resolvedPath;
                if (timeConstraint) {
                    const totalHours = timeConstraint.days * timeConstraint.hoursPerDay;
                    // Mock compression: prioritize first X skills based on impact/time
                    // In a real app, each skill would have an 'estimatedHours' metadata
                    const maxSkills = Math.floor(totalHours / 10); // Assume 10 hours per skill avg
                    finalSteps = resolvedPath.slice(0, maxSkills);
                }

                const steps: LearningStep[] = finalSteps.map(skill => {
                    const userSkill = skills.find(s => s.skillId === skill);
                    return {
                        skill,
                        status: 'pending',
                        videos: [],
                        reason: `Skill '${skill}' identified as gap. Initial Score: ${userSkill?.finalScore.toFixed(2) || 'N/A'}. Prerequisite resolution complete.`
                    };
                });

                set({ 
                    learningPath: { 
                        userId: 'me', // placeholder
                        steps,
                        timeConstraint
                    } 
                });
            },

            rankVideos: (skill: string, videos: any[]) => {
                const scoredVideos = videos.map(v => {
                    // video_score = 0.4 * relevance + 0.3 * view_count + 0.2 * like_ratio + 0.1 * recency
                    
                    // Mocking relevance based on title/description match (0-1)
                    const relevance = v.snippet.title.toLowerCase().includes(skill.toLowerCase()) ? 1 : 0.5;
                    
                    // Normalize view count (log scale for high-view videos)
                    const views = parseInt(v.statistics?.viewCount || "0");
                    const viewScore = Math.min(Math.log10(views + 1) / 7, 1); // 10M views = 1.0
                    
                    // Like ratio (likes/views)
                    const likes = parseInt(v.statistics?.likeCount || "0");
                    const likeRatio = views > 0 ? (likes / views) * 10 : 0.5; // Scale up for impact
                    
                    // Recency score (newer is better, 1.0 for <= 1 year, decay after)
                    const publishedDate = new Date(v.snippet.publishedAt);
                    const now = new Date();
                    const ageInYears = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
                    const recencyScore = Math.max(1 - (ageInYears / 5), 0); // Decay over 5 years

                    const totalScore = (0.4 * relevance) + (0.3 * viewScore) + (0.2 * Math.min(likeRatio, 1)) + (0.1 * recencyScore);

                    return {
                        id: v.id.videoId || v.id,
                        title: v.snippet.title,
                        url: `https://www.youtube.com/watch?v=${v.id.videoId || v.id}`,
                        thumbnail: v.snippet.thumbnails.high.url,
                        channel: v.snippet.channelTitle,
                        duration: v.contentDetails?.duration || "N/A",
                        viewCount: views,
                        likeCount: likes,
                        publishedAt: v.snippet.publishedAt,
                        score: totalScore
                    };
                });

                // Filter duration > 3 mins (Mocked as most API responses don't include duration in search unless specified)
                // Filter by score and sort
                return scoredVideos
                    .filter(v => v.score > 0.4) // Minimum quality bar
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 5);
            },

            getMatchedJobs: async (userId: string) => {
                try {
                    const res = await api.jobs.getFeed(userId);
                    if (res.data) {
                        set({ matchedJobs: res.data.jobs || [] });
                    }
                } catch (e) {
                    console.error("Failed to fetch matched jobs", e);
                }
            },

            persistSkills: async (userId: string) => {
                try {
                    const { userSkills } = get();
                    await api.careerEngine.saveSkills(userId, userSkills);
                } catch (e) {
                    console.error("Failed to persist skills to cloud", e);
                }
            },

            syncWithBackend: async (userId: string) => {
                // Fetch existing skills and path
                try {
                    const res = await api.analytics.getDashboard(userId);
                    if (res.data) {
                        set({
                            userSkills: res.data.skills || [],
                            // Initial scores are normalized 0-1 from backend, we might want to keep the local precision if needed
                        });
                        // Also sync jobs
                        await get().getMatchedJobs(userId);
                        
                        // Sync applied jobs
                        const appRes = await api.applications.getMy(userId);
                        if (appRes.data) {
                            set({ appliedJobs: appRes.data });
                        }
                    }
                } catch (e) {
                    console.error("Failed to sync career metadata", e);
                }
            }
        }),
        {
            name: 'ai-career-intelligence',
            partialize: (state) => ({ 
                userSkills: state.userSkills,
                learningPath: state.learningPath
            }),
        }
    )
);
