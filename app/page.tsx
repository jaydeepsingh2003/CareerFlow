"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Briefcase, Globe, Sparkles, Zap, Shield, ChevronRight, Rocket, Cpu, Terminal, FileText, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-[#020205] text-white selection:bg-primary/30 selection:text-white font-sans overflow-x-hidden">
      {/* Dynamic Mesh Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[140px] animate-pulse opacity-50" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px] opacity-30" />
        <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] bg-purple-600/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-dot-white opacity-[0.05]" />
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 glass-nav px-3 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 sm:gap-3 group cursor-pointer"
          >
            <div className="h-8 sm:h-10 w-8 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center p-0.5 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <div className="h-full w-full bg-black rounded-[8px] sm:rounded-[10px] flex items-center justify-center">
                <Briefcase className="h-4 sm:h-5 w-4 sm:w-5 text-white" />
              </div>
            </div>
            <span className="text-base sm:text-xl font-bold tracking-tighter glow-text">Career<span className="text-primary italic">Flow</span></span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 sm:gap-4"
          >
            <Link href={isAuthenticated ? "/dashboard" : "/login"}>
              <Button variant="ghost" className="text-xs sm:text-sm text-muted-foreground hover:text-white hover:bg-white/5 font-medium px-2 sm:px-4 py-2">
                {isAuthenticated ? "Home" : "Login"}
              </Button>
            </Link>
            {!isAuthenticated && (
              <Link href="/register">
                <Button className="text-xs sm:text-sm bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] border border-primary/20 transition-all hover:scale-105 active:scale-95 px-3 sm:px-6 py-2 sm:py-2 h-9 sm:h-auto">
                  Start
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 sm:pt-44 pb-16 sm:pb-32 px-4 sm:px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center space-y-6 sm:space-y-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 sm:px-5 py-1.5 sm:py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest"
          >
            <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            Simple Career Tools
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9]"
          >
            YOUR BEST <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-cyan-400 animate-shimmer bg-[length:200%_auto]">CAREER MOVE</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-sm sm:text-base md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light px-2"
          >
            CareerFlow helps you build a professional brand, practice for interviews, and find the right jobs.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 pt-4 sm:pt-6"
          >
            <Link href={isAuthenticated ? "/dashboard" : "/register"} className="w-full sm:w-auto">
              <Button size="lg" className="h-12 sm:h-14 md:h-16 px-6 sm:px-10 text-sm sm:text-base md:text-lg bg-primary hover:bg-primary/90 rounded-xl sm:rounded-2xl md:rounded-[2rem] gap-2 sm:gap-3 shadow-[0_20px_50px_rgba(124,58,237,0.3)] group transition-all w-full sm:w-auto">
                Access Dashboard <ArrowRight className="h-4 sm:h-5 w-4 sm:w-5 group-hover:translate-x-2 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="hidden sm:flex h-14 md:h-16 px-8 sm:px-10 text-sm md:text-lg border-white/5 bg-white/[0.02] hover:bg-white/[0.08] rounded-2xl md:rounded-[2rem] backdrop-blur-xl">
              Learn More <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </div>

        {/* Visual Decorative Elements */}
        <div className="absolute top-1/2 left-0 w-full h-full -translate-y-1/2 -z-10 pointer-events-none hidden md:block">
          <div className="absolute top-[30%] left-[5%] animate-float opacity-40 md:opacity-100">
            <div className="glass-panel p-6 rounded-3xl transform -rotate-12 border-primary/20 shadow-2xl">
              <Cpu className="h-8 w-8 text-primary" />
              <div className="mt-4 h-1 w-12 bg-primary/40 rounded-full" />
            </div>
          </div>
          <div className="absolute top-[50%] right-[8%] animate-float opacity-40 md:opacity-100" style={{ animationDelay: '2s' }}>
            <div className="glass-panel p-6 rounded-3xl transform rotate-12 border-blue-500/20 shadow-2xl">
              <Rocket className="h-8 w-8 text-blue-400" />
              <div className="mt-4 h-1 w-12 bg-blue-500/40 rounded-full" />
            </div>
          </div>
        </div>
      </section>



      {/* AI Resume & Portfolio Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[120px] -z-10" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 lg:items-center gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] uppercase font-black text-primary tracking-[0.4em]">Tools for You</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black text-white leading-none tracking-tighter">
              YOUR PERFECT <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">RESUME.</span>
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl font-light">
              Create a professional resume and a beautiful portfolio website in minutes. Our simple tools help you design them and get hired faster.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              {[
                { icon: FileText, title: "Resume Score", desc: "Instantly see how your resume performs." },
                { icon: Globe, title: "Personal Website", desc: "Get a professional portfolio online." },
                { icon: Sparkles, title: "Smart Tips", desc: "Real-time advice to improve your profile." },
                { icon: Rocket, title: "100+ Templates", desc: "Engineered for high-impact roles." }
              ].map((f, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group">
                    <f.icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-tighter">{f.title}</h4>
                    <p className="text-xs text-muted-foreground leading-tight">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4">
              <Link href="/register">
                 <Button className="h-14 px-10 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl gap-3">
                    Start Your Career Move <ArrowRight className="h-5 w-5" />
                 </Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 30 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative p-2 rounded-[3.5rem] bg-gradient-to-tr from-primary/30 to-blue-500/30 border border-white/10 shadow-3xl hover:translate-y-[-10px] transition-all duration-700 overflow-hidden group"
          >
             <img 
               src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=1000" 
               alt="Code Pipeline" 
               className="rounded-[3rem] w-full h-[500px] object-cover mix-blend-overlay opacity-80" 
             />
             <div className="absolute inset-x-0 bottom-0 p-12 bg-gradient-to-t from-black via-black/60 to-transparent pt-32">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-primary/20 text-primary border-primary/20 uppercase text-[10px] tracking-widest font-black">Easy To Use</Badge>
                </div>
                <h3 className="text-3xl font-black text-white leading-tight mb-2">BEAUTIFUL DESIGNS</h3>
                <p className="text-gray-400 text-sm font-light mb-6">Create it once, use it everywhere. Your resume and website are always up to date.</p>
                <Link href="/register">
                  <Button className="w-full bg-white text-black hover:bg-gray-200 h-14 rounded-2xl font-black gap-3 text-lg">
                    Build My Profile <Rocket className="h-5 w-5" />
                  </Button>
                </Link>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-20 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { label: "Jobs Matched Today", value: "14.2k+" },
            { label: "Partner Companies", value: "850+" },
            { label: "Better Job Matches", value: "65%" },
            { label: "Career Success Rate", value: "98.4%" }
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center space-y-1"
            >
              <div className="text-3xl md:text-4xl font-black text-white glow-text">{stat.value}</div>
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Core Protocols (Features) */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto text-center mb-20 space-y-4">
          <h2 className="text-4xl font-black tracking-tight">OUR TOOLS</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Built with smart technology to help you succeed.</p>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            {
              title: "Smart Job Feed",
              description: "No more searching for hours. We understand your skills and show you the jobs you actually want.",
              icon: Globe,
              color: "text-blue-400",
              bg: "bg-blue-400/10"
            },
            {
              title: "Skill Rating",
              description: "See how your skills compare to what companies are looking for. Know your value before you apply.",
              icon: Zap,
              color: "text-yellow-400",
              bg: "bg-yellow-400/10"
            },
            {
              title: "Interview Practice",
              description: "Practice answering questions with our friendly AI based on real job descriptions. Get confident with zero pressure.",
              icon: Sparkles,
              color: "text-purple-400",
              bg: "bg-purple-400/10"
            }
          ].map((protocol, i) => (
            <motion.div
              key={protocol.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-10 rounded-[2.5rem] space-y-6 group border-white/5 hover:border-primary/20"
            >
              <div className={`h-16 w-16 rounded-2xl ${protocol.bg} flex items-center justify-center border border-white/5 group-hover:scale-110 transition-all duration-500`}>
                <protocol.icon className={`h-8 w-8 ${protocol.color}`} />
              </div>
              <h3 className="text-2xl font-bold tracking-tight">{protocol.title}</h3>
              <p className="text-muted-foreground leading-relaxed font-light">{protocol.description}</p>
              <div className="pt-4">
                <Button variant="link" className="text-primary p-0 h-auto group-hover:gap-2 transition-all">
                  Try This Tool <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto glass-panel p-12 md:p-20 rounded-[3rem] text-center border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10" />
          <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">READY TO BOOST YOUR <br /> CAREER GROWTH?</h2>
          <Link href="/register">
            <Button size="lg" className="h-16 px-12 text-lg bg-white text-black hover:bg-gray-200 rounded-2xl font-bold shadow-2xl">
              Join CareerFlow Now
            </Button>
          </Link>
          <p className="mt-8 text-sm text-muted-foreground font-medium uppercase tracking-widest">Takes less than 60 seconds</p>
        </div>
      </section>

      {/* Global Footer */}
      <footer className="py-16 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Briefcase className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold tracking-tighter">CareerFlow</span>
          </div>

          <div className="flex items-center gap-8 text-sm text-muted-foreground font-medium">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Security</Link>
          </div>

          <div className="text-muted-foreground text-[10px] font-mono tracking-wider opacity-50 uppercase">
            &copy; 2026 CAREERFLOW // ALL RIGHTS RESERVED
          </div>
        </div>
      </footer>
    </div>
  );
}
