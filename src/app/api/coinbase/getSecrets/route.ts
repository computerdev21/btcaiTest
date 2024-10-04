import { db } from "@/lib/db";  // Import your database connection
import { $exchangeSecrets } from "@/lib/db/schema";  // Import the table schema
import { eq } from "drizzle-orm";  // Import the `eq` operator for querying
import { NextResponse } from 'next/server';

// Function to fetch exchange secrets based on userId
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        // Log the userId being used for debugging purposes
        console.log("Fetching secrets for userId:", userId);

        // Fetch the secret from the exchangeSecrets table based on userId
        const result = await db
            .select()
            .from($exchangeSecrets)
            .where(eq($exchangeSecrets.userId, userId))
            .limit(1);  // Fetch only the first result

        // Log the result for debugging purposes
        console.log("Database result:", result);

        if (result.length === 0) {
            return NextResponse.json({ apiKey: null, apiSecret: null });
        }

        const { apiKey, apiSecret } = result[0];

        // Return the API key and secret
        return NextResponse.json({ apiKey, apiSecret });
    } catch (error) {
        // Log the error for debugging purposes
        console.error("Error fetching secrets:", error);
        return NextResponse.json({ error: "Failed to fetch secrets" }, { status: 500 });
    }
}
