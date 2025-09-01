"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema } from "@/app/lib/schema";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { updateUser } from "@/actions/user";
import { Loader2 } from "lucide-react";

// Client-side only wrapper to prevent hydration mismatches
const ClientOnly = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return children;
};

const OnboardingForm = ({ industries }) => {

    const [selectedIndustry, setSelectedIndustry] = useState(null);
    const router = useRouter();

    const {
        loading: updateLoading,
        fn: updateUserFn,
        data: updateResult,
      } = useFetch(updateUser);
    

    const {
        register, 
        handleSubmit, 
        formState: {errors}, 
        setValue,
        watch,
        } = useForm({
        resolver: zodResolver(onboardingSchema),
    });

    const onSubmit = async (values) => {

       try{
        const formattedIndustry = `${values.industry}-${values.subIndustry .toLowerCase() .replace(/ /g, "-")}`;

        await updateUserFn({
            ...values,
            industry: formattedIndustry,
        });
       } catch (error) {
        console.error("Onboarding error: ", error);
       }
    }

    useEffect(() => {
        if (updateResult?.success && !updateLoading) {
            toast.success("Profile updated successfully");
            router.push("/dashboard");
            router.refresh();
        }
    }, [updateResult, updateLoading])

    const subIndustry = watch("subIndustry");
    const industry = watch("industry");
    const experience = watch("experience");
    const skills = watch("skills");
    const bio = watch("bio");

    // Calculate progress based on filled fields
    const calculateProgress = () => {
        let completedFields = 0;
        const totalFields = 5; // industry, subIndustry, experience, skills, bio

        if (industry) completedFields++;
        if (subIndustry) completedFields++;
        if (experience && experience > 0) completedFields++;
        if (skills && skills.trim()) completedFields++;
        if (bio && bio.trim()) completedFields++;

        return (completedFields / totalFields) * 100;
    };

    const progress = calculateProgress();

    return (
        <ClientOnly>
            <div className="flex justify-center items-center bg-background">
                <Card className="w-full max-w-lg mt-10 mx-2 bg-background">
                    <CardHeader>
                        <div className="space-y-4">
                            <div>
                                <CardTitle className="gradient-title text-4xl">Complete Your Profile</CardTitle>
                                <CardDescription>Select your industry to get personalized insights and recommendations</CardDescription>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Profile Completion</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-green-500 transition-all duration-300 ease-in-out rounded-full"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form className="w-full space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            <div className="w-full space-y-2">
                                <Label htmlFor="industry">Industry</Label>
                                <Select className="w-full"
                                    onValueChange={(value) => {
                                        setValue("industry", value);
                                        setSelectedIndustry(
                                        industries.find((ind) => ind.id === value)
                                        );
                                        setValue("subIndustry", "");
                                    }}
                                >
                                    <SelectTrigger id="industry" className="w-full">
                                        <SelectValue placeholder="Select an industry" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {industries.map((ind) => {
                                            return <SelectItem value={ind.id} key={ind.id}>{ind.name}</SelectItem>;
                                        })}
                                    </SelectContent>
                                </Select>
                                {errors.industry && (
                                    <p className="text-red-500 text-sm">{errors.industry.message}</p>
                                )}
                            </div>

                            {watch("industry") && (
                                <div className="w-full space-y-2">
                                    <Label htmlFor="subIndustry">Specialization</Label>
                                    <Select className="w-full"
                                        onValueChange={(value) => {
                                            setValue("subIndustry", value);
                                        }}
                                    >
                                        <SelectTrigger id="subIndustry" className="w-full">
                                            <SelectValue placeholder="Select a specialization" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selectedIndustry?.subIndustries.map((ind) => {
                                                return <SelectItem value={ind} key={ind}>{ind}</SelectItem>;
                                            })}
                                        </SelectContent>
                                    </Select>
                                    {errors.subIndustry && (
                                        <p className="text-red-500 text-sm">{errors.subIndustry.message}</p>
                                    )}
                                </div>
                            )}

                                <div className="w-full space-y-2">
                                    <Label htmlFor="experience">Years of Experience</Label>
                                    <Input
                                        id="experience"
                                        type="number"
                                        min="0"
                                        max="50"
                                        className="w-full"
                                        placeholder="Enter years of experience"
                                        {...register("experience")}
                                    />
                                    
                                    {errors.experience && (
                                        <p className="text-red-500 text-sm">{errors.experience.message}</p>
                                    )}
                                </div>

                                <div className="w-full space-y-2">
                                    <Label htmlFor="skills">Skills</Label>
                                    <Input
                                        id="skills"
                                        className="w-full"
                                        placeholder="e.g., Python, JavaScript, Project Management"
                                        {...register("skills")}
                                    />

                                    <p className="text-sm text-muted-foreground">
                                        Enter your skills separated by commas
                                    </p>

                                    {errors.skills && (
                                        <p className="text-red-500 text-sm">{errors.skills.message}</p>
                                    )}
                                </div>

                                <div className="w-full space-y-2">
                                    <Label htmlFor="bio">Professional Bio</Label>
                                    <Textarea
                                        id="bio"
                                        className="w-full h-32"
                                        placeholder="Tell us about your professional journey..."
                                        {...register("bio")}
                                    />
                                    
                                    {errors.bio && (
                                        <p className="text-red-500 text-sm">{errors.bio.message}</p>
                                    )}
                                </div>

                                <Button type="submit" className="w-full" disabled={updateLoading}>
                                    {updateLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Complete Profile"
                                    )}
                                </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </ClientOnly>
    );
};

export default OnboardingForm;