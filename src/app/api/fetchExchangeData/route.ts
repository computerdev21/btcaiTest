import { NextApiRequest, NextApiResponse } from 'next';
import ccxt from 'ccxt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { exchangeId, apiKey, apiSecret } = req.body;

        try {
            // Validate request data
            if (!exchangeId || !apiKey || !apiSecret) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }

            // Check if the exchangeId is a valid exchange class in ccxt
            if (!(exchangeId in ccxt)) {
                return res.status(400).json({ error: 'Unsupported exchange' });
            }

            // Safely cast the exchange class
            const exchangeClass:any = ccxt[exchangeId as keyof typeof ccxt];

            // Initialize the exchange with user's API credentials
            const exchange: any = new exchangeClass({
                apiKey,
                secret: apiSecret,
                enableRateLimit: true, // Enables automatic rate limit handling
            });

            // Load markets (this is required by ccxt before making other API calls)
            await exchange.loadMarkets();

            // Fetch the user's account balance
            const balance: any = await exchange.fetchBalance();

            // Format the balances to be returned in the response
            const balances = Object.keys(balance.total)
                .filter((asset) => balance.total[asset] && balance.total[asset]! > 0)  // Only include assets with non-zero balances
                .map((asset) => ({
                    asset,
                    free: balance.free[asset] ?? 0,  // Provide default values to avoid undefined
                    used: balance.used[asset] ?? 0,
                    total: balance.total[asset] ?? 0,
                }));

            // Send back the formatted balance data
            return res.status(200).json({
                success: true,
                balances,
            });

        } catch (error: unknown) {
            // Cast error to an instance of Error to access the message
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

            console.error('Error fetching exchange data:', errorMessage);
            return res.status(500).json({ success: false, error: errorMessage });
        }
    } else {
        // If the method is not POST, return a 405 Method Not Allowed response
        return res.status(405).json({ error: 'Method not allowed' });
    }
}
