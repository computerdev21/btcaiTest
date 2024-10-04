import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { createPrivateKey } from 'crypto';

const generateJWT = (keyName: string, keySecret: string): string => {
    const requestMethod = 'GET';
    const requestHost = 'api.coinbase.com';
    const requestPath = '/api/v3/brokerage/accounts';
    const algorithm = 'ES256';
    const uri = `${requestMethod} ${requestHost}${requestPath}`;

    // Prepare the JWT payload
    const payload = {
        iss: 'cdp',
        nbf: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 120, // Token expiration time (120 seconds)
        sub: keyName,
        uri,
    };

    // Prepare the JWT header
    const header = {
        alg: algorithm,
        kid: keyName,
        nonce: crypto.randomBytes(16).toString('hex'), // Generate a random nonce
    };

    // Remove the escape sequences and parse the key properly
    const parsedPrivateKey = createPrivateKey({
        key: keySecret.replace(/\\n/g, '\n'),
        format: 'pem',
        type: 'sec1', // EC key type (for ES256)
    });

    // Generate and return the JWT
    return jwt.sign(payload, parsedPrivateKey, { algorithm, header });
};

// API Route handler
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { apiKey, apiSecret } = body;

    if (!apiKey || !apiSecret) {
        return NextResponse.json({ error: 'API key and secret are required' }, { status: 400 });
    }

    try {
        // Generate the JWT
        const jwtToken = generateJWT(apiKey, apiSecret);

        // Make the request to Coinbase API
        const response = await axios.get('https://api.coinbase.com/api/v3/brokerage/accounts', {
            headers: {
                Authorization: `Bearer ${jwtToken}`,
            },
        });

        // Return the account information
        return NextResponse.json(response.data);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch account information' }, { status: 500 });
    }
}
