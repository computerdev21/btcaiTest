import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code'); // Get the authorization code from the URL

    if (!code) {
        return new NextResponse('Authorization code missing', { status: 400 });
    }

    try {
        const tokenResponse = await axios.post('https://api.coinbase.com/oauth/token', {
            grant_type: 'authorization_code',
            code: code,
            client_id: process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID,
            client_secret: process.env.NEXT_PUBLIC_COINBASE_CLIENT_SECRET,
            redirect_uri: process.env.NEXT_PUBLIC_COINBASE_REDIRECT_URI,
        });

        const { access_token } = tokenResponse.data;

        // Set the access token in a cookie or session
        const response = NextResponse.redirect('/'); // Redirect to homepage
        response.cookies.set('coinbase_access_token', access_token, { httpOnly: true, path: '/' });

        return response;

    } catch (error) {
        // Log the error details from Coinbase to debug the issue
        console.error('Error during Coinbase token exchange:', error.response?.data || error.message);
        return new NextResponse('OAuth token exchange failed', { status: 401 });
    }
}
