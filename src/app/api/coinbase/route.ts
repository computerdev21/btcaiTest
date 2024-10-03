import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code'); // Get the authorization code from the query

    if (!code) {
        return new NextResponse('No authorization code provided', { status: 400 });
    }

    try {
        // Attempt to exchange the authorization code for an access token
        const tokenResponse = await axios.post('https://api.coinbase.com/oauth/token', {
            grant_type: 'authorization_code',
            code: code,
            client_id: process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID, // Public-facing client ID
            client_secret: process.env.COINBASE_CLIENT_SECRET, // Server-side only client secret
            redirect_uri: process.env.NEXT_PUBLIC_COINBASE_REDIRECT_URI,
        });

        const { access_token, refresh_token } = tokenResponse.data;

        // Use the access token to fetch user account data from Coinbase
        const accountResponse = await axios.get('https://api.coinbase.com/v2/accounts', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        // Respond with the user's account data
        return NextResponse.json(accountResponse.data);

    } catch (error) {
        // Type assert error as AxiosError
        const axiosError = error as AxiosError;

        // Log the exact error response from Coinbase
        if (axiosError.response) {
            console.error("Error response from Coinbase:", axiosError.response.data);
        } else {
            console.error("Error message:", axiosError.message);
        }

        // Return a generic error response
        return new NextResponse('OAuth token exchange failed', { status: 401 });
    }
}
