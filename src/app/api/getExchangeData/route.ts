import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const responses = await Promise.all([
            fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT').then(res => res.json()),
            fetch('https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=BTCUSDT').then(res => res.json()),
            fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot').then(res => res.json()),
            fetch('https://api.kraken.com/0/public/Ticker?pair=XBTUSD').then(res => res.json()),
            fetch('https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT').then(res => res.json()),
            fetch('https://api-pub.bitfinex.com/v2/ticker/tBTCUSD').then(res => res.json()),
            fetch('https://api.huobi.pro/market/detail/merged?symbol=btcusdt').then(res => res.json())
        ]);

        const data = [
            {
                name: 'Binance',
                spot: responses[0].lastPrice,
                futures: responses[1].lastPrice,
                spotChange: responses[0].priceChangePercent,
                futuresChange: responses[1].priceChangePercent,
                spotVolume: responses[0].volume,
                futuresVolume: responses[1].volume
            },
            {
                name: 'Coinbase',
                spot: responses[2].data.amount,
                futures: 'N/A',
                spotChange: 'N/A',
                futuresChange: 'N/A',
                spotVolume: 'N/A',
                futuresVolume: 'N/A'
            },
            {
                name: 'Kraken',
                spot: responses[3].result.XXBTZUSD.c[0],
                futures: 'N/A',
                spotChange: 'N/A',
                futuresChange: 'N/A',
                spotVolume: 'N/A',
                futuresVolume: 'N/A'
            },
            {
                name: 'OKX',
                spot: responses[4].data[0].last,
                futures: 'N/A',
                spotChange: responses[4].data[0].changePercent,
                futuresChange: 'N/A',
                spotVolume: responses[4].data[0].volCcy24h,
                futuresVolume: 'N/A'
            },
            {
                name: 'Bitfinex',
                spot: responses[5][6], // 6th element is the last price in Bitfinex ticker response
                futures: 'N/A',
                spotChange: 'N/A',
                futuresChange: 'N/A',
                spotVolume: 'N/A',
                futuresVolume: 'N/A'
            },
            {
                name: 'Huobi',
                spot: responses[6].tick.close,
                futures: 'N/A',
                spotChange: responses[6].tick.vol, // Using volume as an approximation of change
                futuresChange: 'N/A',
                spotVolume: responses[6].tick.amount,
                futuresVolume: 'N/A'
            }
        ];

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching exchange data:', error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json(
            { error: 'Failed to fetch exchange data', message: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
