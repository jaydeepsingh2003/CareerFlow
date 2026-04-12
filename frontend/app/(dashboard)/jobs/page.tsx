"use client";

import { JobCard } from "@/components/jobs/job-card";
import { JobFilters } from "@/components/jobs/filters";
import { ApplicationList } from "@/components/jobs/application-list";
import { JobImportModal } from "@/components/jobs/job-import-modal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LayoutGrid, List, Sparkles, Briefcase, History, Search, Loader2, ChevronDown, LineChart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import React, { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/store";
import { useJobFilterStore } from "@/lib/filter-store";
import { MarketInsights } from "@/components/analytics/market-insights";
import { useSearchParams } from "next/navigation";

function JobsPageContent() {
    const user = useAuthStore((state) => state.user);
    const [activeTab, setActiveTab] = useState("discover");

    // Fallback store
    const { appliedFilters: storeFilters, setFilter, applyFilters: syncStoreFilters } = useJobFilterStore();
    const searchParams = useSearchParams();

    // Derive applied filters dynamically from URL or fallback to store
    const appliedFilters = useMemo(() => {
        const roleParam = searchParams.get('role');
        const locationParam = searchParams.get('location');
        const remoteParam = searchParams.get('remote');

        if (roleParam || locationParam || remoteParam) {
            return {
                ...storeFilters,
                role: roleParam ? [roleParam] : [],
                location: locationParam || "",
                remote: remoteParam === 'true',
            };
        }
        return storeFilters;
    }, [searchParams, storeFilters]);

    // Sync URL params to store so Sidebar filters visually update
    useEffect(() => {
        const roleParam = searchParams.get('role');
        const locationParam = searchParams.get('location');
        const remoteParam = searchParams.get('remote');

        if (roleParam || locationParam || remoteParam) {
            if (roleParam) setFilter("role", [roleParam]);
            if (remoteParam) setFilter("remote", remoteParam === 'true');
            if (locationParam) setFilter("location", locationParam);
            syncStoreFilters();
        }
    }, [searchParams, setFilter, syncStoreFilters]);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        refetch
    } = useInfiniteQuery({
        queryKey: ["all-jobs", user?.id, appliedFilters],
        queryFn: ({ pageParam = 1 }: any) =>
            api.jobs.getFeed(user?.id, { ...appliedFilters, page: pageParam, limit: 10 }).then(res => res.data),
        initialPageParam: 1,
        getNextPageParam: (lastPage: any) => {
            const { page, total, limit } = lastPage.pagination;
            return page * limit < total ? page + 1 : undefined;
        },
        refetchInterval: 60000,
    } as any);

    const jobs = (data?.pages as any[])?.flatMap((page: any) => page.jobs) || [];
    const firstPage = (data?.pages as any[])?.[0];
    const totalCount = firstPage?.pagination?.total || jobs.length;

    return (
        <div className="flex flex-col lg:flex-row gap-10 min-h-screen pb-20 animate-in fade-in duration-700">
            {/* Sidebar Filters - Sticky */}
            <aside className="w-full lg:w-80 shrink-0 sticky top-0 h-fit">
                <JobFilters />
            </aside>

            {/* Main Feed Content */}
            <div className="flex-1 min-w-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10">
                        <TabsList className="bg-white/5 border border-white/10 h-14 p-1.5 rounded-2xl backdrop-blur-xl">
                            <TabsTrigger value="discover" className="gap-2 px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-bold">
                                <Search className="h-4 w-4" /> DISCOVER
                            </TabsTrigger>
                            <TabsTrigger value="my-apps" className="gap-2 px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-bold">
                                <History className="h-4 w-4" /> ACTIVITY
                            </TabsTrigger>
                            <TabsTrigger value="insights" className="gap-2 px-8 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white transition-all font-bold">
                                <LineChart className="h-4 w-4" /> MARKET
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <JobImportModal />
                            <div className="flex items-center gap-3 text-xs bg-white/5 px-4 py-2 rounded-2xl border border-white/10 flex-1 sm:flex-none">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-6 w-6 rounded-full border-2 border-[#030303] bg-gradient-to-tr from-primary/40 to-blue-500/40" />
                                    ))}
                                </div>
                                <span className="font-bold text-white/50 uppercase tracking-tighter">842+ Agents active</span>
                            </div>
                        </div>
                    </div>

                    <TabsContent value="discover" className="space-y-8 mt-0 outline-none">
                        {/* Interactive Quantum Header */}
                        <div className="flex flex-col md:flex-row items-center justify-between p-8 md:p-10 glass-panel rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-primary/10 via-transparent to-transparent gap-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -z-10" />
                            <div className="space-y-3">
                                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter flex items-center gap-4">
                                    JOB FEED
                                    <Badge className="bg-primary hover:bg-primary text-[10px] h-6 rounded-lg px-3 border-none flex items-center gap-1.5">
                                        <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                        LIVE
                                    </Badge>
                                </h1>
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[10px] uppercase tracking-widest text-white/70 font-black">Updates every 60s</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground font-medium">
                                        Showing {jobs.length} jobs matched to your skills.
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => refetch()}
                                className="border-white/10 bg-white/5 text-white rounded-2xl h-14 px-8 hover:bg-white/10 hover:border-primary/50 transition-all font-black group shadow-2xl shrink-0"
                            >
                                <History className="h-5 w-5 mr-3 group-hover:rotate-180 transition-transform duration-700 text-primary" /> REFRESH JOBS
                            </Button>
                        </div>

                        {/* Job Scroll Feed */}
                        {isLoading && !isFetchingNextPage ? (
                            <div className="flex flex-col items-center justify-center py-48 gap-8">
                                <div className="h-24 w-24 relative">
                                    <div className="absolute inset-0 border-2 border-primary/10 border-t-primary rounded-full animate-spin" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Briefcase className="h-10 w-10 text-primary/30 animate-pulse" />
                                    </div>
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-2xl font-black text-white tracking-widest uppercase">Searching...</p>
                                    <p className="text-xs text-muted-foreground tracking-widest uppercase font-bold opacity-50">Looking for the best jobs for you...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="grid grid-cols-1 gap-6">
                                    <AnimatePresence mode="popLayout">
                                        {jobs.map((job: any, index: number) => (
                                            <motion.div
                                                key={job.id}
                                                layout
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ delay: Math.min(index * 0.05, 0.4), type: "spring", damping: 20 }}
                                            >
                                                <JobCard job={job} />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {(!jobs || jobs.length === 0) && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center py-32 glass-panel rounded-[3rem] border-dashed border-white/10"
                                        >
                                            <div className="bg-white/5 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-8">
                                                <Search className="h-10 w-10 text-muted-foreground/30" />
                                            </div>
                                            <h3 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">No Jobs Found</h3>
                                            <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                                                Your filters are too strict. Try changing them to see more jobs.
                                            </p>
                                            <Button
                                                variant="outline"
                                                className="mt-10 border-primary/50 text-primary hover:bg-primary/10 rounded-2xl px-10 h-14 font-black transition-all"
                                                onClick={() => useJobFilterStore.getState().resetFilters()}
                                            >
                                                RESET FILTERS
                                            </Button>
                                        </motion.div>
                                    )}
                                </div>

                                {hasNextPage && (
                                    <div className="flex justify-center pt-10 pb-20">
                                        <Button
                                            variant="ghost"
                                            size="lg"
                                            onClick={() => fetchNextPage()}
                                            disabled={isFetchingNextPage}
                                            className="h-16 px-16 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/50 text-white font-black group transition-all"
                                        >
                                            {isFetchingNextPage ? (
                                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                            ) : (
                                                <span className="flex items-center gap-3 uppercase tracking-widest text-sm">
                                                    Load More Jobs <ChevronDown className="h-5 w-5 group-hover:translate-y-2 transition-transform text-primary" />
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="my-apps" className="mt-0 outline-none">
                        <ApplicationList />
                    </TabsContent>
                    <TabsContent value="insights" className="mt-0 outline-none">
                        <MarketInsights />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

export default function JobsPage() {
    return (
        <React.Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        }>
            <JobsPageContent />
        </React.Suspense>
    );
}
