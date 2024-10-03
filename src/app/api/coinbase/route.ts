import { NextRequest, NextResponse } from 'next/server';
import axios, {AxiosError} from 'axios';

// GET /api/coinbase/connect
export async function GET(req: NextRequest) {
    const clientId = process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_COINBASE_REDIRECT_URI;
    const scope = 'wallet:accounts:read,wallet:transactions:read';
    console.log(redirectUri);

    const authorizationUrl = `https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

    // Respond with the authorization URL
    return NextResponse.json({ authorizationUrl });
}

// POST /api/coinbase/callback
export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
        return new NextResponse('No authorization code provided', { status: 400 });
    }

    try {
        // Log the values being sent to Coinbase
        console.log('Authorization code:', code);
        console.log('Client ID:', process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID);
        console.log('Redirect URI:', process.env.NEXT_PUBLIC_COINBASE_REDIRECT_URI);

        const tokenResponse = await axios.post('https://api.coinbase.com/oauth/token', {
            grant_type: 'authorization_code',
            code: code,
            client_id: process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID, // Public-facing client ID
            client_secret: process.env.COINBASE_CLIENT_SECRET, // Server-side only client secret
            redirect_uri: process.env.NEXT_PUBLIC_COINBASE_REDIRECT_URI,
        });

        const { access_token, refresh_token } = tokenResponse.data;

        // Log access and refresh tokens
        console.log('Access Token:', access_token);
        console.log('Refresh Token:', refresh_token);

        // Use the access token to fetch user account data from Coinbase
        const accountResponse = await axios.get('https://api.coinbase.com/v2/accounts', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        return NextResponse.json(accountResponse.data);

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error response from Coinbase:", error.response?.data || error.message);
        } else {
            console.error("Unknown error:", error);
        }

        return new NextResponse('OAuth token exchange failed', { status: 401 });
    }
}
