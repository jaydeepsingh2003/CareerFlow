"use client";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useLayoutStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isSidebarOpen } = useLayoutStore();

    return (
        <div className="flex h-screen overflow-hidden bg-background/50 selection:bg-purple-500/20">
            <Sidebar />
            <MobileNav />
            <main
                className={cn(
                    "flex-1 flex flex-col transition-all duration-300 ease-in-out relative overflow-hidden pb-16 md:pb-0",
                    isSidebarOpen ? "md:ml-64" : "md:ml-20"
                )}
            >
                <Header />
                <div className="flex-1 overflow-x-hidden overflow-y-auto relative">
                    <div className="absolute inset-0 bg-dot-white opacity-20 pointer-events-none" />
                    <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
                    <div className="relative z-10 container py-6 mx-auto max-w-7xl animate-fade-in">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
