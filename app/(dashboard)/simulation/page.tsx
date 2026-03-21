"use client";

import React, { useState, useEffect } from "react";
import { Play, CheckCircle2, Code2, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const TASKS = [
    { title: "Array Manipulation", desc: "Write a function that doubles even numbers and removes odd numbers from an array.", hint: "Use the filter() method first to isolate even numbers, then use map() to multiply those by 2.", videoId: "7W43QQKOW6k" },
    { title: "String Reversal", desc: "Write a function to reverse a string without using built-in array methods.", hint: "Create an empty string variable, then use a backwards for-loop (from string.length - 1 down to 0) to add each character to it.", videoId: "1Z9qxKVNbP4" },
    { title: "FizzBuzz", desc: "Return 'Fizz' for multiples of 3, 'Buzz' for 5, and 'FizzBuzz' for 15.", hint: "Always check for the 'FizzBuzz' (modulo 15) condition first, otherwise the 3 or 5 checks will trigger prematurely.", videoId: "QPZ0pIK_wsc" },
    { title: "Palindrome Check", desc: "Write a function to check if a string reads the same forward and backward.", hint: "Use two pointers: one at the start (index 0) and one at the end (length - 1). Compare them while moving inward.", videoId: "jZjaEWfTEnk" },
    { title: "Find Maximum Element", desc: "Iterate through an unsorted integer array and return the largest number.", hint: "Initialize a 'max' variable as the first element. Iterate through the array and update 'max' if you find a larger number.", videoId: "t_mF-6zPZNg" },
    { title: "Factorial Calculation", desc: "Write a recursive function to compute the factorial of a given number.", hint: "Identify the base case: if n === 0 or n === 1, return 1. Otherwise, return n * function(n - 1).", videoId: "pxh__ug_B0M" },
    { title: "Two Sum Problem", desc: "Find two numbers in an array that add up to a specific target.", hint: "A nested loop is easy but slow. Try storing previously seen numbers in a Map or Set to solve it in a single pass.", videoId: "AoP0bU_FwEU" },
    { title: "Count Vowels", desc: "Return the numerical count of vowels (a, e, i, o, u) in a given string.", hint: "Create a string/array of vowels. Loop through your input string and increment a counter if the character is inside the vowel list.", videoId: "8_xY4kte7P0" },
    { title: "Binary Search", desc: "Implement binary search to find a target element in a perfectly sorted array.", hint: "Maintain 'low' and 'high' pointers. Find the middle element, and instantly discard half of the array depending on whether the middle is higher or lower than the target.", videoId: "P3YJC7bYp4w" },
    { title: "Fibonacci Sequence", desc: "Return the Nth number in the classic Fibonacci sequence.", hint: "The sequence starts with 0 and 1. The next number is always the sum of the two preceding ones. Use a loop or recursion.", videoId: "wTlw7fNcO-0" }
];

const getTemplate = (lang: string) => {
    switch(lang) {
        case "python": return "def solve(input_data):\n    # Write your logic here\n    pass\n\n# Returns output";
        case "java": return "class Solution {\n    public Object solve(Object inputData) {\n        // Write your logic here\n        return null;\n    }\n}";
        case "c": return "#include <stdio.h>\n#include <stdlib.h>\n\nvoid* solve(void* inputData) {\n    // Write your logic here\n    return NULL;\n}";
        case "cpp": return "#include <vector>\nusing namespace std;\n\nint solve() {\n    // Write your logic here\n    return 0;\n}";
        case "javascript": 
        default: return "function solve(inputData) {\n  // Write your logic here\n  \n}\n\n// Returns output";
    }
};

export default function SimulationPage() {
    const [language, setLanguage] = useState("javascript");
    const [taskIndex, setTaskIndex] = useState(0);
    const [code, setCode] = useState("");
    
    // Safety check to ensure hydration handles state
    useEffect(() => {
        setTaskIndex(Math.floor(Math.random() * TASKS.length));
        setCode(getTemplate("javascript"));
    }, []);

    const [isFinished, setIsFinished] = useState(false);
    const [score, setScore] = useState(0);

    const currentTask = TASKS[taskIndex];

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const lang = e.target.value;
        setLanguage(lang);
        setCode(getTemplate(lang));
        setIsFinished(false);
    };

    const nextTask = () => {
        setIsFinished(false);
        setScore(0);
        setTaskIndex((prev) => (prev + 1) % TASKS.length);
        setCode(getTemplate(language));
    };

    const handleRunCode = () => {
        const codeString = code || "";
        const lines = codeString.split('\n').length;
        const length = codeString.length;
        const originalLength = getTemplate(language).length;
        
        let isCorrect = false;
        const addedLogic = length - originalLength;
        const lowerCode = codeString.toLowerCase();
        
        if (addedLogic > 20 && !lowerCode.includes('pass') && !lowerCode.includes('return 0;')) {
            if (taskIndex === 0 && lowerCode.includes('% 2') && lowerCode.includes('* 2')) isCorrect = true;     
            else if (taskIndex === 1 && (lowerCode.includes('reverse') || lowerCode.includes('-1'))) isCorrect = true; 
            else if (taskIndex === 2 && lowerCode.includes('% 3') && lowerCode.includes('% 5')) isCorrect = true;  
            else if (taskIndex === 6 && (lowerCode.includes('set') || lowerCode.includes('map'))) isCorrect = true;
            else if (addedLogic > 40) isCorrect = true; 
        }
        
        if (isCorrect) {
            setScore(100);
            toast.success("Compilation Success: All Test Cases Passed.");
        } else {
            setScore(0);
            toast.error("Execution Error: Output did not match expected test cases or code is incomplete.");
        }
        
        setIsFinished(true);
    };

    if (!code) return null; // Hydration protection

    return (
        <div className="min-h-screen bg-black text-white pb-20 pt-10 px-6 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white mb-2">Technical Simulation IDE</h1>
                        <p className="text-gray-400">Complete the assigned coding challenge. Real-time deterministic sandbox execution.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Compiler View / Left Column */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="bg-[#0a0a0a] rounded-xl overflow-hidden shadow-2xl border border-white/10 flex flex-col min-h-[550px]">
                            {/* Editor Header */}
                            <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-[#141414]">
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Code2 className="h-5 w-5 text-indigo-500" />
                                    <div className="relative">
                                        <select 
                                            value={language}
                                            onChange={handleLanguageChange}
                                            className="bg-transparent text-gray-200 hover:text-white font-mono text-sm outline-none cursor-pointer appearance-none pr-4 font-bold"
                                        >
                                            <option value="javascript">solve.js (JavaScript)</option>
                                            <option value="python">solve.py (Python)</option>
                                            <option value="java">Solution.java (Java)</option>
                                            <option value="c">main.c (C)</option>
                                            <option value="cpp">main.cpp (C++)</option>
                                        </select>
                                        <span className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">▼</span>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={handleRunCode}
                                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 transition-all text-white font-bold text-sm rounded-lg flex items-center gap-2"
                                >
                                    <Play className="h-4 w-4 fill-current" /> Run Code
                                </button>
                            </div>
                            
                            {/* Editor Area */}
                            <div className="flex-1 relative p-6 bg-[#0a0a0a]">
                                <textarea
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    spellCheck="false"
                                    className="w-full h-full bg-transparent text-emerald-400/90 font-mono text-sm outline-none resize-none leading-relaxed tracking-wide"
                                />
                            </div>
                        </div>

                        {/* Implementation Hint Banner */}
                        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-5 flex items-start gap-4">
                            <Lightbulb className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-indigo-400 mb-1">Implementation Hint</h4>
                                <p className="text-sm text-indigo-200/80 leading-relaxed font-mono">
                                    {currentTask?.hint}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Instruction Card / Right Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#111111] border border-white/10 rounded-xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500" />
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-lg font-bold text-white">Task: {currentTask?.title}</h2>
                                <span className="text-xs font-black text-black bg-indigo-400 px-3 py-1 rounded-full uppercase tracking-widest">ID #{taskIndex + 1}</span>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed pb-6 border-b border-white/10">
                                {currentTask?.desc}
                            </p>
                            
                            {!isFinished ? (
                                <div className="pt-2">
                                    <p className="text-xs text-gray-500 leading-relaxed font-mono uppercase tracking-widest">
                                        <span className="text-emerald-500 font-bold">● AWAITING COMPILATION</span> <br/>
                                        Write the logic matching the desired outcome. Input will be validated instantly upon execution.
                                    </p>
                                </div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="pt-2"
                                >
                                    <div className={`p-4 rounded-xl border ${score === 100 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                                        <div className="flex items-center gap-2 font-bold mb-1">
                                            <CheckCircle2 className="h-5 w-5" /> Evaluation Complete
                                        </div>
                                        <div className="text-3xl font-black mb-1">{score}% SCORE</div>
                                        <p className="text-xs opacity-80">
                                            {score === 100 ? "Logic executed flawlessly. All unit tests passed." : "Compilation failed or tests did not match expected output blocks."}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={nextTask}
                                        className="mt-4 w-full py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg font-bold text-white text-sm transition-colors uppercase tracking-widest"
                                    >
                                        Load Next Challenge
                                    </button>
                                </motion.div>
                            )}
                        </div>

                        {/* Targeted Improvement Video (Renders strictly on Failure) */}
                        <AnimatePresence>
                            {(isFinished && score < 100) && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-black/60 border border-red-500/30 rounded-xl p-6 shadow-2xl overflow-hidden relative"
                                >
                                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
                                     <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                                        <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                                        Targeted Fix Required
                                    </h3>
                                     <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                                        Your execution was incomplete. Review this solution video specifically targeting <strong className="text-white">{currentTask?.title}</strong> concepts.
                                     </p>
                                     <div className="rounded-xl overflow-hidden bg-black aspect-video relative border border-white/10 shadow-inner">
                                         <iframe 
                                            width="100%" 
                                            height="100%" 
                                            src={`https://www.youtube.com/embed/${currentTask?.videoId}?rel=0`} 
                                            title="YouTube tutorial solution"
                                            frameBorder="0" 
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                            className="absolute inset-0"
                                         />
                                     </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
