import { create } from 'zustand';

interface JobFilterStore {
    filters: {
        role: string[];
        remote: boolean;
        location: string;
        salaryRange: number[];
        skills: string[];
    };
    appliedFilters: JobFilterStore['filters'];
    setFilter: (key: keyof JobFilterStore['filters'], value: any) => void;
    applyFilters: () => void;
    resetFilters: () => void;
}

export const useJobFilterStore = create<JobFilterStore>((set) => ({
    filters: {
        role: [],
        remote: false,
        location: "",
        salaryRange: [50],
        skills: [],
    },
    appliedFilters: {
        role: [],
        remote: false,
        location: "",
        salaryRange: [50],
        skills: [],
    },
    setFilter: (key, value) => set((state) => ({
        filters: { ...state.filters, [key]: value }
    })),
    applyFilters: () => set((state) => ({
        appliedFilters: { ...state.filters }
    })),
    resetFilters: () => set({
        filters: {
            role: [],
            remote: false,
            location: "",
            salaryRange: [50],
            skills: [],
        },
        appliedFilters: {
            role: [],
            remote: false,
            location: "",
            salaryRange: [50],
            skills: [],
        }
    }),
}));
