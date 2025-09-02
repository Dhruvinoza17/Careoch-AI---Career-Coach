"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../lib/prisma.js";
import { generateAIInsights } from "./dashboard.js";

export async function updateUser(data) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {
            clerkUserId: userId,
        },
    });

    if (!user) throw new Error("User not found");

    try {

        const result = await db.$transaction (
            async (tx) => {
                // find if the industry exists
                let industryInsight = await tx.industryInsight.findUnique({
                    where: {
                        industry: data.industry,
                    },
                });

                // If industry doesn't exist create it with default values - will replace it with ai later
                if (!industryInsight) {
                    // Validate industry data
                    if (!data.industry || data.industry.trim() === '') {
                        throw new Error('Industry is required and cannot be empty');
                    }

                    let insights;
                    try {
                        insights = await generateAIInsights(data.industry);
                    } catch (error) {
                        console.warn('Failed to generate AI insights, using fallback:', error.message);
                        // Import the fallback function from dashboard actions
                        const { getFallbackInsights } = await import('./dashboard.js');
                        insights = await getFallbackInsights(data.industry);
                    }

                    industryInsight = await tx.industryInsight.create({
                        data:{
                            industry: data.industry,
                            ...insights,
                            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        },
                    });
                  };

                // update the user
                const updatedUser = await tx.user.update({
                    where: {
                        id: user.id,
                    },
                    data: {
                        industry: data.industry,
                        experience: data.experience,
                        bio: data.bio,
                        skills: data.skills,
                    },
                });

                return { industryInsight, updatedUser };
        },
        {
            timeout: 10000,     // default 5000
        });

        return { success: true, ...result };

    } catch (error) {
        console.error("Error updating user and industry:", error.message);
        throw new Error(`Failed to update profile: ${error.message}`);
    }

}

export async function getUserOnboardingStatus () {
    try {
        const { userId } = await auth();
        if (!userId) {
            return { isOnboarded: false };
        }

        // Check if DATABASE_URL is configured
        if (!process.env.DATABASE_URL) {
            console.warn('DATABASE_URL is not configured. Returning default onboarding status.');
            return { isOnboarded: false };
        }

        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            },
            select: {
                industry: true,
            },
        });

        return {
            isOnboarded: !!user?.industry,
        };
    } catch (error) {
        console.error("Error checking onboarding status:", error.message);
        // Return default status instead of throwing error
        return { isOnboarded: false };
    }
}