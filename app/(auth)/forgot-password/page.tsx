
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
    const [submitted, setSubmitted] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden w-full max-w-md"
        >
            <Link href="/login" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
            </Link>

            {!submitted ? (
                <>
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-white tracking-tight">Reset password</h1>
                        <p className="text-sm text-muted-foreground mt-2">Enter your email and we&apos;ll send you a reset link.</p>
                    </div>

                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input id="email" type="email" placeholder="name@example.com" required className="bg-white/5 border-white/10" />
                        </div>

                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                            Send Reset Link
                        </Button>
                    </form>
                </>
            ) : (
                <div className="text-center py-8">
                    <div className="h-12 w-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-4">
                        <Mail className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
                    <p className="text-sm text-muted-foreground mb-6">We&apos;ve sent a password reset link to your email address.</p>
                    <Button variant="outline" className="w-full border-white/10 text-white" onClick={() => setSubmitted(false)}>
                        Resend email
                    </Button>
                </div>
            )}
        </motion.div>
    );
}
