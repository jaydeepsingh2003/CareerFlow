import axios from 'axios';
import { ApiResponse, User, Profile, Job, ReadinessPlan, Resume, ATSAssessment, Application } from './api-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth Interceptor
apiClient.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const api = {
    auth: {
        register: (data: any) => apiClient.post<any>('/auth/register', data),
        login: (data: any) => apiClient.post<any>('/auth/login', data),
    },

    profile: {
        get: (userId: string) => apiClient.get<Profile>(`/profile/me?userId=${userId}`),
        update: (data: any) => apiClient.post<Profile>('/profile/update', data),
    },

    jobs: {
        getFeed: (userId?: string, filters: any = {}) => {
            const params = new URLSearchParams();
            if (userId) params.append('userId', userId);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
            if (filters.role?.length > 0) {
                const cleanRoles = filters.role.filter((r: string) => r.trim() !== '');
                if (cleanRoles.length > 0) params.append('role', cleanRoles.join(','));
            }
            if (filters.skills?.length > 0) {
                const cleanSkills = filters.skills.filter((s: string) => s.trim() !== '');
                if (cleanSkills.length > 0) params.append('skills', cleanSkills.join(','));
            }
            if (filters.remote) params.append('location', 'Remote');
            if (filters.salaryRange?.[0] && filters.salaryRange[0] !== 50) params.append('salary', filters.salaryRange[0].toString());

            return apiClient.get<{ jobs: Job[]; pagination: any }>(`/jobs/feed?${params.toString()}`);
        },
        getFilterOptions: () => apiClient.get<{ roles: string[]; skills: string[] }>('/jobs/filter-options').then(res => res.data),
        getById: (id: string) => apiClient.get<Job>(`/jobs/${id}`),
        create: (data: any) => apiClient.post<Job>('/jobs', data),
        analyze: (id: string) => apiClient.post(`/jobs/${id}/analyze`),
        import: (data: { url: string; userId: string }) =>
            apiClient.post<Job>(`/jobs/import?userId=${data.userId}`, { url: data.url }),
        apply: (jobId: string, userId: string) =>
            apiClient.post(`/jobs/${jobId}/apply?userId=${userId}`),
    },

    resume: {
        upload: (data: any) => apiClient.post<Resume>('/resume/create', data),
        score: (resumeId: string, jobId: string) =>
            apiClient.post<ATSAssessment>('/resume/score', { resumeId, jobId }),
        getAssessment: (resumeId: string) =>
            apiClient.get<ATSAssessment>(`/resume/${resumeId}/assessment`),
        getByUserId: (userId: string) =>
            apiClient.get<Resume[]>(`/resume/user/${userId}`),
    },

    readiness: {
        generate: (userId: string, jobId: string) =>
            apiClient.post<ReadinessPlan>('/readiness/generate', { userId, jobId }),
        getScore: (userId: string) =>
            apiClient.get(`/readiness/score/${userId}`),
        getPlan: (userId: string) =>
            apiClient.get<ReadinessPlan>(`/readiness/plan/${userId}`),
    },

    applications: {
        getMy: (userId: string) => apiClient.get<Application[]>(`/applications/me?userId=${userId}`),
        updateStatus: (data: { userId: string, jobId: string, status: string }) =>
            apiClient.put('/applications/status', data),
        getStats: (userId: string) => apiClient.get<any>(`/applications/stats/${userId}`),
    },

    interview: {
        start: (data: { userId: string; jobId?: string; jobTitle?: string }) =>
            apiClient.post('/interview/start', data),
        submitAnswer: (data: { questionId: string; answer: string }) =>
            apiClient.patch('/interview/answer', data),
        complete: (id: string) =>
            apiClient.post(`/interview/${id}/complete`),
        getHistory: (userId: string) =>
            apiClient.get(`/interview/user/${userId}`),
        getDetails: (id: string) =>
            apiClient.get(`/interview/${id}`),
    },

    analytics: {
        getSystemStats: () => apiClient.get('/analytics/system-stats'),
        getMatchDistribution: () => apiClient.get('/analytics/match-distribution'),
        getDashboard: (userId: string) => apiClient.get(`/analytics/dashboard/${userId}`),
        getTrends: (userId: string) => apiClient.get(`/analytics/trends/${userId}`),
        getFunnel: (userId: string) => apiClient.get(`/analytics/funnel/${userId}`),
    },

    notifications: {
        getMy: (userId: string) => apiClient.get(`/notifications/me?userId=${userId}`),
        getUnreadCount: (userId: string) => apiClient.get(`/notifications/unread-count?userId=${userId}`),
        markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),
        markAllAsRead: (userId: string) => apiClient.post('/notifications/read-all', { userId }),
    },

    events: {
        getLogs: (userId?: string) =>
            apiClient.get(`/events${userId ? `?userId=${userId}` : ''}`),
    },

    system: {
        health: () => apiClient.get('/health'),
    },

    careerEngine: {
        // AI Assessment
        startAssessment: (userId: string) => apiClient.post('/ai-career/assessment/start', { userId }),
        submitAnswer: (assessmentId: string, data: { userId: string, answer: string, currentStep: number }) => 
            apiClient.post(`/ai-career/assessment/${assessmentId}/answer`, data),
        
        // Simulation
        getSimulation: (userId: string, domain?: string) => 
            apiClient.get(`/ai-career/simulation?userId=${userId}${domain ? `&domain=${domain}` : ''}`),
        submitSimulation: (data: { taskId: string; userId: string; correctness: number; timeTaken: number; attempts: number }) =>
            apiClient.post('/ai-career/simulation/submit', data),

        // Persistence
        saveSkills: (userId: string, skills: any[]) => 
            apiClient.post('/ai-career/skills/sync', { userId, skills }),

        // Skill & Path
        getLearningPath: (userId: string, timeConstraint?: any) => 
            apiClient.get(`/ai-career/learning-path/${userId}`, { params: timeConstraint }),
        fetchVideos: (skill: string) => 
            apiClient.get(`/ai-career/videos?skill=${skill}`),
        
        // Job Match
        matchJob: (jobId: string, userId: string) => 
            apiClient.get(`/ai-career/job-match?jobId=${jobId}&userId=${userId}`),
        
        // Resume Enhance
        enhanceResume: (resumeId: string, mode: string) => 
            apiClient.post('/ai-career/resume/enhance', { resumeId, mode }),
    }
};

export default api;
