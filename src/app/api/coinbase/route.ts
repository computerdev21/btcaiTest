import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// GET /api/coinbase/connect
export async function GET(req: NextRequest) {
    const clientId = process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_COINBASE_REDIRECT_URI;
    const scope = 'wallet:accounts:read,wallet:transactions:read';
    console.log(clientId);

    const authorizationUrl = `https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

    // Respond with the authorization URL
    return NextResponse.json({ authorizationUrl });
}

// POST /api/coinbase/callback
export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    try {
        const response = await axios.post('https://api.coinbase.com/oauth/token', {
            grant_type: 'authorization_code',
            code: code,
            client_id: process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID,
            client_secret: process.env.NEXT_PUBLIC_COINBASE_CLIENT_SECRET,
            redirect_uri: process.env.NEXT_PUBLIC_COINBASE_REDIRECT_URI,
        });

        const { access_token, refresh_token } = response.data;

        // Fetch user data from Coinbase API using the access token
        const accountData = await axios.get('https://api.coinbase.com/v2/accounts', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        // Respond with account data
        return NextResponse.json(accountData.data);

    } catch (error) {
        console.error('Error during Coinbase OAuth callback:', error);
        // Return a generic error response
        return new NextResponse('OAuth error', { status: 500 });
    }
}
