"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Loader2, Plus, X } from "lucide-react";

export default function SettingsPage() {
    const user = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();
    const [skillsInput, setSkillsInput] = useState("");
    const [profileData, setProfileData] = useState({
        firstName: "",
        lastName: "",
        headline: "",
        bio: "",
        location: "",
        skills: [] as string[],
    });

    const { data: profile, isLoading } = useQuery({
        queryKey: ["profile", user?.id],
        queryFn: () => api.profile.get(user?.id!),
        enabled: !!user?.id,
    });

    useEffect(() => {
        if (profile?.data) {
            setProfileData({
                firstName: profile.data.firstName || "",
                lastName: profile.data.lastName || "",
                headline: profile.data.headline || "",
                bio: profile.data.bio || "",
                location: profile.data.location || "",
                skills: profile.data.skills?.map((s: any) => s.skill.name) || [],
            });
        }
    }, [profile]);

    const updateProfileMutation = useMutation({
        mutationFn: (data: any) => api.profile.update({ ...data, userId: user?.id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
            toast.success("Profile updated successfully!");
        },
        onError: () => {
            toast.error("Failed to update profile.");
        }
    });

    const handleAddSkill = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && skillsInput.trim()) {
            e.preventDefault();
            if (!profileData.skills.includes(skillsInput.trim())) {
                setProfileData({
                    ...profileData,
                    skills: [...profileData.skills, skillsInput.trim()],
                });
            }
            setSkillsInput("");
        }
    };

    const removeSkill = (skillToRemove: string) => {
        setProfileData({
            ...profileData,
            skills: profileData.skills.filter(s => s !== skillToRemove),
        });
    };

    const handleSave = () => {
        updateProfileMutation.mutate(profileData);
    };

    if (isLoading) return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and professional profile.</p>
            </div>

            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList className="bg-white/5 border border-white/5 p-1 rounded-xl">
                    <TabsTrigger value="profile" className="rounded-lg">Profile</TabsTrigger>
                    <TabsTrigger value="account" className="rounded-lg">Account</TabsTrigger>
                    <TabsTrigger value="notifications" className="rounded-lg">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="glass-card p-6 rounded-2xl space-y-6 border border-white/10 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-white">Professional Profile</h3>
                            <p className="text-xs text-muted-foreground italic">Required for AI Job Matching</p>
                        </div>
                        <Separator className="bg-white/5" />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>First Name</Label>
                                <Input
                                    value={profileData.firstName}
                                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                    className="bg-white/5 border-white/10 focus:border-primary/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Last Name</Label>
                                <Input
                                    value={profileData.lastName}
                                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                    className="bg-white/5 border-white/10 focus:border-primary/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Professional Headline</Label>
                            <Input
                                placeholder="e.g. Senior Full Stack Engineer | React & Node.js"
                                value={profileData.headline}
                                onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })}
                                className="bg-white/5 border-white/10 focus:border-primary/50"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Bio</Label>
                            <Textarea
                                placeholder="Describe your experience and career goals..."
                                rows={4}
                                value={profileData.bio}
                                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                className="bg-white/5 border-white/10 focus:border-primary/50 resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Input
                                placeholder="e.g. San Francisco, CA (Remote)"
                                value={profileData.location}
                                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                className="bg-white/5 border-white/10 focus:border-primary/50"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label>Skills</Label>
                            <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-2 rounded-xl bg-white/5 border border-dashed border-white/10">
                                {profileData.skills.length === 0 && <p className="text-xs text-muted-foreground p-1">No skills added yet.</p>}
                                {profileData.skills.map((skill) => (
                                    <span key={skill} className="flex items-center gap-1 bg-primary/20 text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-full border border-primary/30">
                                        {skill}
                                        <button onClick={() => removeSkill(skill)} className="hover:text-white">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="relative">
                                <Input
                                    placeholder="Add a skill (e.g. TypeScript) and press Enter"
                                    value={skillsInput}
                                    onChange={(e) => setSkillsInput(e.target.value)}
                                    onKeyDown={handleAddSkill}
                                    className="bg-white/5 border-white/10 pr-10"
                                />
                                <Plus className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={handleSave}
                                className="w-full sm:w-auto px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                                disabled={updateProfileMutation.isPending}
                            >
                                {updateProfileMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
