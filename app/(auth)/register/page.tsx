"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

const formSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const response = await api.auth.register(values);
            const { user, access_token } = response.data;

            setAuth(user, access_token);

            toast.success("Account created successfully!");
            router.push("/dashboard");
        } catch (err: any) {
            const message = err.response?.data?.message || "Registration failed. Please try again.";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden w-full max-w-lg"
        >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />

            <Link href="/login" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-white transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Create an account</h1>
                <p className="text-sm text-muted-foreground mt-2">Start your journey to your dream career today.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John" {...field} className="bg-white/5 border-white/10" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Doe" {...field} className="bg-white/5 border-white/10" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="name@example.com" {...field} className="bg-white/5 border-white/10" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Create a password" {...field} className="bg-white/5 border-white/10" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-4 h-11" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                    </Button>
                </form>
            </Form>

            <p className="text-center text-xs text-muted-foreground mt-6">
                By clicking continue, you agree to our <a href="#" className="underline hover:text-white">Terms of Service</a> and <a href="#" className="underline hover:text-white">Privacy Policy</a>.
            </p>
        </motion.div>
    );
}
