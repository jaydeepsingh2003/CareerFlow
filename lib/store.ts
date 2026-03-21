import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, ReadinessPlan } from './api-types';

interface LayoutStore {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    isLoading: boolean;
    setIsLoading: (val: boolean) => void;
}

export const useLayoutStore = create<LayoutStore>((set) => ({
    isSidebarOpen: true,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    isLoading: false,
    setIsLoading: (val) => set({ isLoading: val }),
}));

interface AuthStore {
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const setTokenCookie = (token: string | null) => {
    if (typeof document !== 'undefined') {
        if (token) {
            document.cookie = `access_token=${token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
        } else {
            document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
    }
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            setAuth: (user, token) => {
                localStorage.setItem('access_token', token);
                setTokenCookie(token);
                set({ user, token, isAuthenticated: true });
            },
            logout: () => {
                localStorage.removeItem('access_token');
                setTokenCookie(null);
                set({ user: null, token: null, isAuthenticated: false });
            },
        }),
        {
            name: 'kodnest-auth',
        }
    )
);

interface ReadinessStore {
    plan: ReadinessPlan | null;
    isAnalyzing: boolean;
    setPlan: (plan: ReadinessPlan | null) => void;
    setIsAnalyzing: (loading: boolean) => void;
}

export const useReadinessStore = create<ReadinessStore>((set) => ({
    plan: null,
    isAnalyzing: false,
    setPlan: (plan) => set({ plan }),
    setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
}));
