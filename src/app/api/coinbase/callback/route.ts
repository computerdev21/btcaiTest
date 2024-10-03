import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code'); // Get the authorization code

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

        // Store the access token in a cookie (alternatively, you can store it in a session or database)
        const response = NextResponse.redirect('/'); // Redirect to the home page or reload
        response.cookies.set('coinbase_access_token', access_token, { httpOnly: true, path: '/' }); // Set token in cookie

        return response;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Error during Coinbase token exchange:", error.response?.data || error.message);
        } else {
            console.error("Unknown error:", error);
        }

        return new NextResponse('OAuth token exchange failed', { status: 401 });
    }
}
