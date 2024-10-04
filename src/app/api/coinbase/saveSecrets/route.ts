import { db } from "@/lib/db";  // Import the database connection
import { $exchangeSecrets } from "@/lib/db/schema";  // Import the table schema
import { NextResponse } from 'next/server';

// Function to store exchange secrets
export async function POST(request: Request) {
    const { userId, apiKey, apiSecret } = await request.json();

    if (!userId || !apiKey || !apiSecret) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
        // Insert into the exchangeSecrets table
        await db.insert($exchangeSecrets).values({
            userId,
            apiKey,
            apiSecret,
        });
        return NextResponse.json({ message: "Secrets saved successfully!" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to save secrets" }, { status: 500 });
    }
}
