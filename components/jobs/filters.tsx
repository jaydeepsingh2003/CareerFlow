
"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Filter, Search, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useJobFilterStore } from "@/lib/filter-store";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

export function JobFilters() {
    const { filters, setFilter, resetFilters, applyFilters } = useJobFilterStore();

    const { data: options, isLoading: isLoadingOptions } = useQuery({
        queryKey: ["filter-options"],
        queryFn: () => api.jobs.getFilterOptions(),
    });

    const toggleRole = (role: string) => {
        const current = filters.role;
        const next = current.includes(role)
            ? current.filter(r => r !== role)
            : [...current, role];
        setFilter("role", next);
    };

    const toggleSkill = (skill: string) => {
        const current = filters.skills;
        const next = current.includes(skill)
            ? current.filter(s => s !== skill)
            : [...current, skill];
        setFilter("skills", next);
    };

    const roles = options?.roles || [];
    const availableSkills = options?.skills || [];

    return (
        <div className="glass-panel w-full flex flex-col h-fit sticky top-28 rounded-[2rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-6 hidden lg:flex">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                    <Filter className="h-4 w-4 text-primary" />
                    Filters
                </h3>
                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-[10px] font-bold text-muted-foreground hover:text-white h-7 px-3 bg-white/5 rounded-full uppercase tracking-widest">
                    Reset
                </Button>
            </div>

            <div className="space-y-8">
                {/* Remote Toggle */}
                <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                    <Label htmlFor="remote" className="text-xs font-bold uppercase tracking-widest text-white/50">Remote Only</Label>
                    <Switch
                        id="remote"
                        checked={filters.remote}
                        onCheckedChange={(val) => setFilter("remote", val)}
                        className="data-[state=checked]:bg-primary"
                    />
                </div>

                {/* Roles */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Target Role</h4>
                    {isLoadingOptions ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-6 w-full bg-white/5 animate-pulse rounded-lg" />)}
                        </div>
                    ) : (
                        <ScrollArea className="h-[180px] pr-4">
                            <div className="space-y-2.5">
                                {roles.map((role) => (
                                    <div key={role} className="flex items-center space-x-3 group cursor-pointer">
                                        <Checkbox
                                            id={role}
                                            checked={filters.role.includes(role)}
                                            onCheckedChange={() => toggleRole(role)}
                                            className="h-5 w-5 border-white/10 rounded-md data-[state=checked]:bg-primary"
                                        />
                                        <Label htmlFor={role} className="text-sm text-muted-foreground cursor-pointer group-hover:text-white transition-colors line-clamp-1 font-medium">{role}</Label>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                <Separator className="bg-white/5" />

                {/* Salary Range */}
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Min Compensation</h4>
                        <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 rounded-md px-2 py-0 h-5 font-bold">${filters.salaryRange[0]}k+</Badge>
                    </div>
                    <Slider
                        value={filters.salaryRange}
                        onValueChange={(val) => setFilter("salaryRange", val)}
                        max={200}
                        step={10}
                        className="[&_.relative]:h-1.5"
                    />
                </div>

                <Separator className="bg-white/5" />

                {/* Skills */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Neural Identifiers</h4>
                    {isLoadingOptions ? (
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-7 w-16 bg-white/5 animate-pulse rounded-full" />)}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {availableSkills.map((skill) => (
                                <Button
                                    key={skill}
                                    variant={filters.skills.includes(skill) ? "secondary" : "outline"}
                                    size="sm"
                                    onClick={() => toggleSkill(skill)}
                                    className={cn(
                                        "h-8 text-[11px] border-white/10 rounded-full font-bold transition-all",
                                        filters.skills.includes(skill)
                                            ? "bg-primary text-white border-primary"
                                            : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                                    )}
                                >
                                    {skill}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="pt-4">
                    <Button
                        onClick={applyFilters}
                        className="w-full bg-primary hover:bg-primary/90 text-white font-black h-12 rounded-2xl shadow-[0_10px_30px_rgba(124,58,237,0.3)] flex items-center justify-center gap-3 group transition-all active:scale-95 uppercase tracking-widest text-xs"
                    >
                        <Search className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        Update Matrix
                    </Button>
                </div>
            </div>
        </div>
    );
}
