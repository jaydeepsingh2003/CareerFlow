"use client";

import React, { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function NotificationBell() {
    const [mounted, setMounted] = useState(false);
    const user = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();

    useEffect(() => {
        setMounted(true);
    }, []);

    const { data: notifications } = useQuery({
        queryKey: ["notifications", user?.id],
        queryFn: () => api.notifications.getMy(user?.id!),
        enabled: !!user?.id,
        refetchInterval: 30000, // Poll every 30s
    });

    const markReadMutation = useMutation({
        mutationFn: (id: string) => api.notifications.markAsRead(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] }),
    });

    const unreadCount = notifications?.data?.filter((n: any) => !n.isRead).length || 0;

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
                <Bell className="h-5 w-5" />
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:bg-white/5 hover:text-white transition-colors">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-background animate-pulse" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 glass-card border-white/10" align="end">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full">{unreadCount} new</span>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <ScrollArea className="h-[300px]">
                    {notifications?.data?.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground italic">
                            No notifications yet.
                        </div>
                    ) : (
                        notifications?.data?.map((n: any) => (
                            <DropdownMenuItem
                                key={n.id}
                                className={cn(
                                    "flex flex-col items-start gap-1 p-3 cursor-pointer transition-colors",
                                    !n.isRead ? "bg-primary/5" : "opacity-60"
                                )}
                                onClick={() => markReadMutation.mutate(n.id)}
                            >
                                <div className="flex w-full items-center justify-between gap-2">
                                    <span className="font-bold text-xs text-white">{n.title}</span>
                                    <span className="text-[10px] text-muted-foreground shrink-0">
                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{n.message}</p>
                            </DropdownMenuItem>
                        ))
                    )}
                </ScrollArea>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem
                    className="text-center justify-center text-[10px] text-primary hover:text-primary/80 font-bold uppercase tracking-widest cursor-pointer"
                    onClick={() => api.notifications.markAllAsRead(user?.id!)}
                >
                    Mark all as read
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
