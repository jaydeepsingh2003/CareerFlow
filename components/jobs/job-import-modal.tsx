"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Linkedin, Briefcase, Link as LinkIcon, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function JobImportModal() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const user = useAuthStore((state) => state.user);

    const handleImport = async () => {
        if (!url) return;
        setLoading(true);

        try {
            await api.jobs.import({ url, userId: user?.id! });
            toast.success("Job imported successfully!");
            setOpen(false);
            setUrl("");
            window.location.reload(); // Quick refresh to show new job
        } catch (error) {
            toast.error("Failed to import job. Please verify the URL.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-white/5 border-white/10 hover:bg-white/10">
                    <LinkIcon className="h-4 w-4" /> Import Job
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-white/10 bg-[#0a0a0f]/95 backdrop-blur-xl text-white">
                <DialogHeader>
                    <DialogTitle>Smart Job Import</DialogTitle>
                    <DialogDescription>
                        Paste a job link from LinkedIn or Naukri to instantly analyze and track it.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <div className="relative">
                        <Input
                            placeholder="https://www.linkedin.com/jobs/view/..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="pl-9 bg-white/5 border-white/10 focus:border-purple-500/50"
                        />
                        <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="flex gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Linkedin className="h-3 w-3" /> LinkedIn</span>
                        <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> Naukri</span>
                        <span className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Generic</span>
                    </div>

                    <Button
                        onClick={handleImport}
                        disabled={loading || !url}
                        className="bg-purple-600 hover:bg-purple-700 text-white w-full"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Import & Analyze"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
