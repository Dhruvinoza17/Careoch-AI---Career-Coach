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
    // Simple deterministic hash to vary values per industry
    const hash = Array.from(industry).reduce((acc, c) => (acc * 33 + c.charCodeAt(0)) % 101, 0);
    const growthRate = 3 + (hash % 15); // 3..17
    const demandLevels = ["LOW", "MEDIUM", "HIGH"];
    const marketOutlooks = ["NEGATIVE", "NEUTRAL", "POSITIVE"];
    const demandLevel = demandLevels[hash % demandLevels.length];
    const marketOutlook = marketOutlooks[(hash >> 2) % marketOutlooks.length];

    const baseSkills = [
        `${industry} Fundamentals`,
        `${industry} Tools`,
        "Communication",
        "Problem Solving",
        "Data Analysis",
        "Leadership",
    ];
    const topSkills = Array.from(new Set(baseSkills)).slice(0, 5);
    const recommendedSkills = [
        `${industry} Frameworks`,
        `${industry} Best Practices`,
        "Project Management",
        "Collaboration",
        "Testing/QA",
    ];
    const keyTrends = [
        `${industry} Automation`,
        `${industry} AI Adoption`,
        `${industry} Cloud Migration`,
        `${industry} Security`,
        `${industry} Sustainability`,
    ];

    return {
        salaryRange: [
            { role: `${industry} Analyst`, min: 45000 + hash * 100, max: 75000 + hash * 120, median: 60000 + hash * 110, location: "US" },
            { role: `${industry} Specialist`, min: 55000 + hash * 110, max: 90000 + hash * 130, median: 72000 + hash * 120, location: "US" },
            { role: `${industry} Manager`, min: 70000 + hash * 120, max: 120000 + hash * 140, median: 95000 + hash * 130, location: "US" },
            { role: `${industry} Director`, min: 90000 + hash * 130, max: 150000 + hash * 160, median: 120000 + hash * 140, location: "US" },
            { role: `${industry} Consultant`, min: 80000 + hash * 115, max: 130000 + hash * 145, median: 105000 + hash * 135, location: "US" }
        ],
        growthRate,
        demandLevel,
        topSkills,
        marketOutlook,
        keyTrends,
        recommendedSkills,
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

        // Refresh insights if nextUpdate has passed
        if (user.industryInsight.nextUpdate && user.industryInsight.nextUpdate <= new Date()) {
            const insights = process.env.GEMINI_API_KEY
                ? await generateAIInsights(user.industry)
                : await getFallbackInsights(user.industry);

            const updated = await db.industryInsight.update({
                where: { industry: user.industry },
                data: {
                    ...insights,
                    lastUpdated: new Date(),
                    nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
            });

            return updated;
        }

        return user.industryInsight;
    } catch (error) {
        console.error("Error getting industry insights:", error.message);
        return null;
    }
}