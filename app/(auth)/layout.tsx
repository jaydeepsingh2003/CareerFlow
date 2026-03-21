
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [particles, setParticles] = useState<any[]>([]);

    useEffect(() => {
        const newParticles = [...Array(20)].map((_, i) => ({
            id: i,
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            duration: Math.random() * 10 + 10,
        }));
        setParticles(newParticles);
    }, []);

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-black selection:bg-purple-500/30">

            {/* Animated Background */}
            <div className="absolute inset-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px] animate-pulse delay-1000" />
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-blue-900/10 blur-[100px] animate-float" />
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-grid-white opacity-20" />

            {/* Particles (Simulated with simple dots for performance) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        className="absolute bg-white/10 rounded-full"
                        style={{
                            width: p.width,
                            height: p.height,
                            top: p.top,
                            left: p.left,
                        }}
                        animate={{
                            y: [0, -100],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                {children}
            </div>
        </div>
    );
}
