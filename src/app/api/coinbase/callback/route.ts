import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const clientId = process.env.NEXT_PUBLIC_COINBASE_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_COINBASE_REDIRECT_URI;
    const scope = 'wallet:accounts:read,wallet:transactions:read';

    console.log('Redirect URI:', redirectUri);

    const authorizationUrl = `https://www.coinbase.com/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

    // Respond with the authorization URL to redirect the user to Coinbase
    return NextResponse.json({ authorizationUrl });
}
