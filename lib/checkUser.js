import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
    try {
        const user = await currentUser();

        if (!user) {
            return null;
        }

        // Check if DATABASE_URL is configured
        if (!process.env.DATABASE_URL) {
            console.warn('DATABASE_URL is not configured. Database operations will be skipped.');
            return null;
        }

        const loggedInUser = await db.user.findUnique({
            where: {
                clerkUserId: user.id,
            },
        });

        if (loggedInUser) {
            return loggedInUser;
        }

        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();

        const newUser = await db.user.create({
            data: {
                clerkUserId: user.id,
                name: name || 'User',
                imageUrl: user.imageUrl,
                email: user.emailAddresses[0]?.emailAddress || '',
            },
        });

        return newUser;
    } catch (error) {
        // Log the error but don't crash the app
        if (error.code === 'P1001') {
            console.warn('Database connection failed. Please check your DATABASE_URL configuration.');
        } else {
            console.error('Error in checkUser:', error.message);
        }
        return null;
    }
}