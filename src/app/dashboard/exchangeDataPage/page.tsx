'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from 'js-cookie'; // Use js-cookie for handling cookies

const ExchangeDataPage = () => {
    const [data, setData] = useState<any>(null);
    const [coinbaseData, setCoinbaseData] = useState<any>(null); // Store Coinbase data
    const [loading, setLoading] = useState(false);

    // Fetch the exchange data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("/api/getExchangeData");
                setData(response.data);
            } catch (error) {
                console.error("Error fetching exchange data:", error);
            }
        };

        fetchData();
    }, []);

    // Fetch the Coinbase data if the user is connected
    useEffect(() => {
        const fetchCoinbaseData = async () => {
            const accessToken = Cookies.get('coinbase_access_token'); // Get the Coinbase access token from the cookie
            if (accessToken) {
                try {
                    const response = await axios.get('https://api.coinbase.com/v2/accounts', {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });
                    setCoinbaseData(response.data); // Set the Coinbase data
                } catch (error) {
                    console.error("Error fetching Coinbase data:", error);
                }
            }
        };

        fetchCoinbaseData();
    }, []);

    const handleCoinbaseConnect = async () => {
        setLoading(true); // Set loading state to true when starting the connection
        try {
            const response = await axios.get('/api/coinbase/connect'); // Correct API endpoint
            const { authorizationUrl } = response.data;
            window.location.href = authorizationUrl; // Redirects the user to Coinbase for OAuth
        } catch (error) {
            console.error('Error connecting to Coinbase:', error);
            setLoading(false); // If there is an error, reset loading state
        }
    };

    if (!data) {
        return <div>Loading exchange data...</div>;
    }

    return (
        <div className="grainy min-h-screen" style={{caretColor: 'transparent'}}>
            <div className="max-w-7xl mx-auto p-10 flex flex-col">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Spot and Futures Data
                </h1>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 grid-cols-1 gap-6">
                    {data.map((exchange: any) => (
                        <div
                            key={exchange.name}
                            className="border border-stone-300 rounded-lg p-4 flex flex-col hover:shadow-xl transition hover:-translate-y-1"
                        >
                            <h2 className="text-2xl font-semibold text-gray-900">
                                {exchange.name}
                            </h2>
                            <p className="text-sm text-gray-500">Spot Price: ${exchange.spot}</p>
                            <p className="text-sm text-gray-500">Futures Price: ${exchange.futures}</p>
                            <p className="text-sm text-gray-500">Spot Change: {exchange.spotChange}</p>
                            <p className="text-sm text-gray-500">Futures Change: {exchange.futuresChange}</p>
                            <p className="text-sm text-gray-500">Spot Volume: {exchange.spotVolume}</p>
                            <p className="text-sm text-gray-500">Futures Volume: {exchange.futuresVolume}</p>
                        </div>
                    ))}
                </div>

                {/* Display Coinbase data if available */}
                {coinbaseData && (
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 my-8">Coinbase Account Data</h1>
                        <pre>{JSON.stringify(coinbaseData, null, 2)}</pre>
                    </div>
                )}

                <h1 className="text-3xl font-bold text-gray-900 my-8 flex">Connect To an exchange</h1>
                <div
                    className="cursor-pointer text-lg font-bold border-2 border-solid border-black w-1/3 text-center hover:shadow-xl transition hover:-translate-y-1"
                    onClick={handleCoinbaseConnect}
                >
                    {loading ? "Connecting..." : "Coinbase"}
                </div>
            </div>
        </div>
    );
};

export default ExchangeDataPage;
