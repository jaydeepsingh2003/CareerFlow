"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
    Building2,
    GraduationCap,
    LayoutDashboard,
    Settings,
    LogOut,
    Menu,
    X,
    Briefcase,
    BrainCircuit,
    Target,
    FileText,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const navItems = [
    { icon: LayoutDashboard, label: "Career Home", href: "/dashboard" },
    { icon: Target, label: "Skill Sessions", href: "/simulation" },
    { icon: Briefcase, label: "Smart Jobs", href: "/jobs" },
    { icon: Target, label: "Job Matcher", href: "/job-alignment" },
    { icon: BrainCircuit, label: "Skill Tracker", href: "/resume-analysis" },
    { icon: FileText, label: "Resume Builder", href: "/resume" },
    { icon: Settings, label: "Settings", href: "/settings" },
];

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/");
        setIsOpen(false);
    };

    const isActive = (href: string) => pathname === href;

    return (
        <>
            {/* Mobile Menu Button - Hidden on desktop */}
            <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-white/10 bg-black/40 backdrop-blur-xl">
                {/* Bottom Navigation Bar */}
                <nav className="flex justify-around items-center h-16 px-2">
                    {navItems.slice(0, 4).map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-0.5 px-3 py-2 rounded-lg transition-all duration-200",
                                    isActive(item.href)
                                        ? "text-primary bg-primary/10"
                                        : "text-neutral-500 hover:text-white"
                                )}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-[7px] font-black uppercase tracking-widest leading-none">
                                    {item.label.split(" ")[0]}
                                </span>
                            </Link>
                        );
                    })}
                    {/* Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex flex-col items-center justify-center gap-0.5 px-3 py-2 text-neutral-500 hover:text-white rounded-lg transition-all duration-200"
                    >
                        {isOpen ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                        <span className="text-[7px] font-black uppercase tracking-widest leading-none">More</span>
                    </button>
                </nav>
            </div>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-30 bg-black/50 md:hidden"
                        />
                        {/* Menu Content */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 400 }}
                            className="fixed bottom-16 left-0 right-0 z-30 bg-black/80 backdrop-blur-xl border-t border-white/10 md:hidden"
                        >
                            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                                {/* Additional Items */}
                                {navItems.slice(4).map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                "flex items-center gap-4 px-6 py-4 border-b border-white/5 transition-colors duration-200",
                                                isActive(item.href)
                                                    ? "bg-primary/10 text-primary"
                                                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                                            )}
                                        >
                                            <Icon className="w-5 h-5 shrink-0" />
                                            <span className="text-sm font-semibold">{item.label}</span>
                                        </Link>
                                    );
                                })}

                                {/* User Info & Logout */}
                                <div className="px-6 py-4 border-b border-white/5">
                                    <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-2">Account</p>
                                    <p className="text-sm font-bold text-white mb-4">{user?.email}</p>
                                    <Button
                                        onClick={handleLogout}
                                        variant="outline"
                                        className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}