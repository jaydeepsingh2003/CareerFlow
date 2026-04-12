"use client";

import { motion } from "framer-motion";

export default function AIAvatar({ currentState }: { currentState: "idle" | "thinking" | "speaking" }) {
  // Determine properties based on state
  const isThinking = currentState === "thinking";
  const isSpeaking = currentState === "speaking";

  // Base colors for gradients
  const baseGradient = isSpeaking 
    ? "from-cyan-400 via-blue-500 to-violet-600" // Speaking: bright cyan/blue
    : isThinking 
      ? "from-violet-500 via-fuchsia-500 to-pink-500" // Thinking: deep purple/pink/fast
      : "from-white/10 via-white/5 to-transparent"; // Idle: calm, barely visible glow

  return (
    <div className="relative flex items-center justify-center h-48 w-48">
      
      {/* 1. Outer Massive Glow (Ambient light) */}
      <motion.div
        animate={{
          scale: isSpeaking ? [1, 1.3, 1] : isThinking ? [1, 1.1, 1] : [1, 1.05, 1],
          opacity: isSpeaking ? [0.6, 0.9, 0.6] : isThinking ? [0.4, 0.6, 0.4] : [0.1, 0.2, 0.1],
        }}
        transition={{
          repeat: Infinity,
          duration: isSpeaking ? 1 : isThinking ? 1.5 : 4,
          ease: "easeInOut",
        }}
        className={`absolute inset-[-40px] rounded-full bg-gradient-to-tr ${baseGradient} blur-[40px]`}
      />

      {/* 2. Core Orb with liquid rotation */}
      <motion.div
        animate={{
          rotate: isThinking ? [0, 360] : isSpeaking ? [0, -360] : [0, 180],
          scale: isSpeaking ? [1, 1.1, 1] : isThinking ? [1, 1.05, 1] : 1,
        }}
        transition={{
          rotate: { repeat: Infinity, duration: isThinking ? 2 : isSpeaking ? 3 : 20, ease: "linear" },
          scale: { repeat: Infinity, duration: isSpeaking ? 0.3 : 1.5, ease: "easeInOut", repeatType: "mirror" }, // rapid pulsing for speech
        }}
        className={`relative h-32 w-32 rounded-full overflow-hidden shadow-2xl ${
          currentState === "idle" ? "border border-white/10 bg-black/40 backdrop-blur-xl" : ""
        }`}
      >
        {currentState !== "idle" && (
          <div className={`absolute inset-0 bg-gradient-to-tr ${baseGradient} opacity-90`} />
        )}
        
        {/* Inner highlight offset to give a 3D spherical look */}
        {currentState !== "idle" && (
          <motion.div 
            animate={{ 
              x: isSpeaking ? [-10, 15, -10] : isThinking ? [-20, 20, -20] : 0, 
              y: isSpeaking ? [10, -15, 10] : isThinking ? [-20, 20, -20] : 0 
            }}
            transition={{ repeat: Infinity, duration: isSpeaking ? 0.5 : 2, ease: "easeInOut" }}
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.5)_0%,_rgba(255,255,255,0)_40%)] mix-blend-overlay" 
          />
        )}
      </motion.div>

      {/* 3. Center indicator (optional, just to ground it if needed. Leaving empty for a clean orb) */}
      {currentState === "idle" && (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-white/20 animate-pulse" />
        </div>
      )}

    </div>
  );
}
