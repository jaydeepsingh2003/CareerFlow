"use client";

import { useLayoutStore, useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  GraduationCap,
  LayoutDashboard,
  PieChart,
  Settings,
  LogOut,
  ChevronLeft,
  Briefcase,
  Video,
  FileText,
  Globe,
  BrainCircuit,
  Target,
  Zap,
  Mic,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Career Home", href: "/dashboard" },
  { icon: Target, label: "Practice Tests", href: "/simulation" },
  { icon: BrainCircuit, label: "AI Interviewer", href: "/interview-studio" },
  { icon: Briefcase, label: "Smart Jobs", href: "/jobs" },
  { icon: Target, label: "Job Matcher", href: "/job-alignment" },
  { icon: BrainCircuit, label: "Skill Tracker", href: "/resume-analysis" },
  { icon: FileText, label: "Resume Builder", href: "/resume" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const { isSidebarOpen, toggleSidebar } = useLayoutStore();
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <motion.aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-white/10 bg-black/40 backdrop-blur-xl transition-all duration-300 ease-in-out hidden md:flex flex-col",
        isSidebarOpen ? "w-64" : "w-20",
      )}
      initial={false}
      animate={{ width: isSidebarOpen ? 256 : 80 }}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-white/5">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 overflow-hidden"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
            <span className="text-white font-bold">C</span>
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-lg text-white whitespace-nowrap"
              >
                CareerFlow
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hover:bg-white/5 text-muted-foreground w-8 h-8 hidden md:flex"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              !isSidebarOpen && "rotate-180",
            )}
          />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {sidebarItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group overflow-hidden",
                isActive
                  ? "bg-primary/10 text-primary shadow-[0_0_20px_rgba(124,58,237,0.15)]"
                  : "text-muted-foreground hover:bg-white/5 hover:text-white",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-white",
                )}
              />

              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="whitespace-nowrap font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {isActive && (
                <motion.div
                  layoutId="active-indicator"
                  className="absolute inset-0 border border-primary/20 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section (Bottom) */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <button
          onClick={() => router.push("/settings")}
          className={cn(
            "flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/5 transition-colors text-left group",
            !isSidebarOpen && "justify-center",
          )}
        >
          <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 p-[1px]">
            <div className="h-full w-full rounded-full bg-black/50 overflow-hidden">
              <img
                src={`https://ui-avatars.com/api/?name=${user?.firstName || "User"}&background=random`}
                alt="User"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <AnimatePresence>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="overflow-hidden flex-1"
              >
                <p className="text-sm font-medium text-white truncate">
                  {user?.firstName || "User"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user?.email || "free@plan.com"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className={cn(
            "w-full text-muted-foreground hover:text-red-400 hover:bg-red-400/10 justify-start gap-3 px-2 h-9",
            !isSidebarOpen && "justify-center",
          )}
        >
          <LogOut className="h-4 w-4" />
          {isSidebarOpen && <span>Logout</span>}
        </Button>
      </div>
    </motion.aside>
  );
}
