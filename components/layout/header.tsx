
"use client"

import { useState, useEffect } from "react";
import { useLayoutStore, useAuthStore } from "@/lib/store";
import { useJobFilterStore } from "@/lib/filter-store";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bell, Search, Menu } from "lucide-react";
import { NotificationBell } from "./notification-bell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function Header() {
    const [mounted, setMounted] = useState(false);
    const { toggleSidebar } = useLayoutStore();
    const { user, logout } = useAuthStore();
    const { setFilter, applyFilters } = useJobFilterStore();
    const router = useRouter();
    const [search, setSearch] = useState("");

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        if (!search.trim()) return;

        let queryStr = search.trim().toLowerCase();
        let role = queryStr;
        let isRemote = false;
        let location = "";

        // Detect "remote"
        if (queryStr.includes("remote")) {
            isRemote = true;
            role = role.replace("remote", "").trim();
        }

        // Detect location using "in [City]"
        const inMatch = role.match(/\bin\b\s+(.+)$/i);
        if (inMatch) {
            location = inMatch[1].trim();
            role = role.replace(inMatch[0], "").trim();
        }

        // Clean up role string
        role = role.replace(/\s+/g, ' ').trim();

        // Build URL parameters
        const params = new URLSearchParams();
        if (role) params.append("role", role);
        if (location) params.append("location", location);
        if (isRemote) params.append("remote", "true");

        // Navigate with URL params instead of just setting local state
        router.push(`/jobs?${params.toString()}`);
    };

    if (!mounted) return <header className="h-16 border-b border-white/5 bg-background/60" />;

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/5 bg-background/60 px-6 backdrop-blur-xl shadow-sm">
            <Button
                variant="ghost"
                size="icon"
                className="md:hidden shrink-0 text-muted-foreground hover:bg-white/5"
                onClick={toggleSidebar}
            >
                <Menu className="h-5 w-5" />
            </Button>

            <div className="flex flex-1 items-center gap-4 md:gap-8">
                <form onSubmit={handleSearch} className="relative flex-1 md:w-full md:max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search jobs, companies, skills..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white/5 pl-9 md:w-[300px] lg:w-[400px] focus:w-full transition-all duration-300 border-white/5 focus:bg-white/10"
                    />
                </form>
            </div>

            <div className="flex items-center gap-4">
                <NotificationBell />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-white/10 p-0 overflow-hidden hover:ring-primary/50 transition-all">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={`https://ui-avatars.com/api/?name=${user?.firstName || 'User'}&background=random`} alt={user?.firstName} />
                                <AvatarFallback>{user?.firstName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Billing
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer"
                        >
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
