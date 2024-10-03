import { NextRequest, NextResponse } from 'next/server';
import axios, { AxiosError } from 'axios';

// Handle the /api/coinbase/callback GET request
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code'); // Get the authorization code from the URL

    if (!code) {
        return new NextResponse('Authorization code missing', { status: 400 });
    }

    try {
        // Log the values being sent to Coinbase
        console.log('Authorization code:', code);
        console.log('Client ID:', process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID);
        console.log('Redirect URI:', process.env.NEXT_PUBLIC_COINBASE_REDIRECT_URI);
        console.log(process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID)

        const tokenResponse = await axios.post('https://api.coinbase.com/oauth/token', {
            grant_type: 'authorization_code',
            code: code,
            client_id: process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID,
            client_secret: process.env.NEXT_PUBLIC_COINBASE_CLIENT_SECRET,
            redirect_uri: process.env.NEXT_PUBLIC_COINBASE_REDIRECT_URI,
        });

        const { access_token, refresh_token } = tokenResponse.data;

        // Log access and refresh tokens
        console.log('Access Token:', access_token);
        console.log('Refresh Token:', refresh_token);

        // Fetch the user's account data using the access token
        const accountResponse = await axios.get('https://api.coinbase.com/v2/accounts', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        return NextResponse.json(accountResponse.data);

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error during Coinbase token exchange:", error.response?.data || error.message);
        } else {
            console.error("Unknown error:", error);
        }

        return new NextResponse('OAuth token exchange failed', { status: 401 });
    }
}
