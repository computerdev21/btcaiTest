import { NextResponse } from 'next/server';
import * as ccxt from 'ccxt';

export async function GET() {
    try {
        const exchanges = [
            new ccxt.binance(),
            new ccxt.coinbase(),
            new ccxt.kraken(),
            new ccxt.okx(),
            new ccxt.bitfinex(),
            new ccxt.huobi()
        ];

        const data = await Promise.all(exchanges.map(async (exchange) => {
            const ticker = await exchange.fetchTicker('BTC/USDT');

            let futuresTicker = null;
            if (exchange.has['future']) {
                try {
                    futuresTicker = await exchange.fetchTicker('BTC/USDT:USDT', { market_type: 'future' });
                } catch (e) {
                    console.error(`Failed to fetch futures data for ${exchange.id}:`, e);
                }
            }

            return {
                name: exchange.id,
                spot: ticker.last,
                futures: futuresTicker ? futuresTicker.last : 'N/A',
                spotChange: ticker.percentage,
                futuresChange: futuresTicker ? futuresTicker.percentage : 'N/A',
                spotVolume: ticker.baseVolume,
                futuresVolume: futuresTicker ? futuresTicker.baseVolume : 'N/A'
            };
        }));

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error fetching exchange data:', error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json(
            { error: 'Failed to fetch exchange data', message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
