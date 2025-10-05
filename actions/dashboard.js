"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const generateAIInsights= async (industry) => {
    // Validate industry input
    if (!industry || industry.trim() === '') {
        throw new Error('Industry parameter is required and cannot be empty');
    }

    const prompt = `
        Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
        {
        "salaryRange": [
            { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
        ],
        "growthRate": number,
        "demandLevel": "HIGH" | "MEDIUM" | "LOW",
        "topSkills": ["skill1", "skill2"],
        "marketOutlook": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
        "keyTrends": ["trend1", "trend2"],
        "recommendedSkills": ["skill1", "skill2"]
        }
        
        IMPORTANT: 
        - Return ONLY the JSON. No additional text, notes, or markdown formatting.
        - Include at least 5 common roles for salary ranges.
        - Growth rate should be a percentage (0-100).
        - Include at least 5 skills and trends.
        - Use proper role names related to ${industry} industry.
        - Do not use "Null" in any field names or values.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

        const insights = JSON.parse(cleanedText);
        
        // Validate and clean the AI response
        return validateAndCleanInsights(insights, industry);
    } catch (error) {
        console.error('Error generating AI insights:', error);
        // Return fallback data if AI generation fails
        return await getFallbackInsights(industry);
    }
};

const validateAndCleanInsights = (insights, industry) => {
    // Clean up any "Null" values in the data
    const cleanInsights = {
        salaryRange: insights.salaryRange?.map(role => ({
            ...role,
            role: role.role?.replace(/Null\s*/gi, '').trim() || `${industry} Professional`
        })) || [],
        growthRate: typeof insights.growthRate === 'number' ? insights.growthRate : 5,
        demandLevel: ['HIGH', 'MEDIUM', 'LOW'].includes(insights.demandLevel) ? insights.demandLevel : 'MEDIUM',
        topSkills: insights.topSkills?.filter(skill => skill && !skill.toLowerCase().includes('null')) || [],
        marketOutlook: ['POSITIVE', 'NEUTRAL', 'NEGATIVE'].includes(insights.marketOutlook) ? insights.marketOutlook : 'NEUTRAL',
        keyTrends: insights.keyTrends?.filter(trend => trend && !trend.toLowerCase().includes('null')) || [],
        recommendedSkills: insights.recommendedSkills?.filter(skill => skill && !skill.toLowerCase().includes('null')) || []
    };

    return cleanInsights;
};

export const getFallbackInsights = async (industry) => {
    return {
        salaryRange: [
            { role: `${industry} Analyst`, min: 50000, max: 80000, median: 65000, location: "US" },
            { role: `${industry} Specialist`, min: 60000, max: 90000, median: 75000, location: "US" },
            { role: `${industry} Manager`, min: 70000, max: 120000, median: 95000, location: "US" },
            { role: `${industry} Director`, min: 90000, max: 150000, median: 120000, location: "US" },
            { role: `${industry} Consultant`, min: 80000, max: 130000, median: 105000, location: "US" }
        ],
        growthRate: 5,
        demandLevel: "MEDIUM",
        topSkills: ["Communication", "Problem Solving", "Technical Skills", "Leadership", "Analytics"],
        marketOutlook: "NEUTRAL",
        keyTrends: ["Digital Transformation", "Remote Work", "Sustainability", "Automation", "Innovation"],
        recommendedSkills: ["Communication", "Technical Skills", "Project Management", "Data Analysis", "Leadership"]
    };
};

export async function getIndustryInsights() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return null;
        }

        // Check if DATABASE_URL is configured
        if (!process.env.DATABASE_URL) {
            console.warn('DATABASE_URL is not configured. Returning null for industry insights.');
            return null;
        }

        const user = await db.user.findUnique({
            where: {
                clerkUserId: userId,
            },
            include: {
                industryInsight: true,
            },
        });

        if (!user) {
            return null;
        }

        if (!user.industryInsight) {
            // Validate that user has an industry
            if (!user.industry || user.industry.trim() === '') {
                console.warn('User does not have a valid industry set. Cannot generate insights.');
                return null;
            }

            // Check if GEMINI_API_KEY is configured
            if (!process.env.GEMINI_API_KEY) {
                console.warn('GEMINI_API_KEY is not configured. Using fallback insights.');
                const fallbackInsights = await getFallbackInsights(user.industry);
                
                const industryInsight = await db.industryInsight.create({
                    data:{
                        industry: user.industry,
                        ...fallbackInsights,
                        nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                });

                return industryInsight;
            }

            const insights = await generateAIInsights(user.industry);

            const industryInsight = await db.industryInsight.create({
                data:{
                    industry: user.industry,
                    ...insights,
                    nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });

            return industryInsight;
        }

        return user.industryInsight;
    } catch (error) {
        console.error("Error getting industry insights:", error.message);
        return null;
    }
}