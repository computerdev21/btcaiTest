'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";

const ExchangeDataPage = () => {
    const [data, setData] = useState<any>(null);
    const [coinbaseData, setCoinbaseData] = useState<any>(null); // Store Coinbase data
    const [loading, setLoading] = useState(false);
    const [apiKey, setApiKey] = useState<string>(''); // Store API Key
    const [apiSecret, setApiSecret] = useState<string>(''); // Store API Secret
    const [userId, setUserId] = useState<string>('user-123'); // Hardcoded userId for now

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

    // Check if API secrets exist in the backend and fetch data automatically
    useEffect(() => {
        const checkAndFetchCoinbaseData = async () => {
            try {
                // Fetch API secrets for the current user
                const response = await axios.get(`/api/coinbase/getSecrets?userId=${userId}`);
                const { apiKey, apiSecret } = response.data;

                // If API secrets exist, use them to fetch Coinbase data automatically
                if (apiKey && apiSecret) {
                    setApiKey(apiKey);
                    setApiSecret(apiSecret);
                    await handleCoinbaseData(apiKey, apiSecret);
                }
            } catch (error) {
                console.error("Error fetching saved API secrets:", error);
            }
        };

        checkAndFetchCoinbaseData();
    }, [userId]);


    // Function to save API secrets to the backend
    const saveExchangeSecrets = async (apiKey: string, apiSecret: string) => {
        try {
            await axios.post("/api/coinbase/saveSecrets", {
                userId,
                apiKey,
                apiSecret,
            });
            console.log("Secrets saved successfully!");
        } catch (error) {
            console.error("Error saving API secrets:", error);
        }
    };

    // Fetch Coinbase data using the API key and secret provided by the user
    const handleCoinbaseData = async (providedApiKey?: string, providedApiSecret?: string) => {
        setLoading(true);
        const key = providedApiKey || apiKey;
        const secret = providedApiSecret || apiSecret;

        try {
            const response = await axios.post('/api/coinbase/connect-api', {
                apiKey: key,        // API Key entered by the user
                apiSecret: secret    // API Secret entered by the user
            });
            setCoinbaseData(response.data); // Set Coinbase data

            // Save the API key and secret to the backend
            await saveExchangeSecrets(key, secret);
        } catch (error) {
            console.error("Error fetching Coinbase data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to format and display Coinbase account data
    const renderCoinbaseAccounts = () => {
        return coinbaseData?.accounts.map((account: any) => (
            <div
                key={account.uuid}
                className="border border-stone-300 rounded-lg p-4 flex flex-col hover:shadow-xl transition hover:-translate-y-1 mb-4"
            >
                <h2 className="text-xl font-semibold text-gray-900">
                    {account.name} ({account.currency})
                </h2>
                <p className="text-sm text-gray-500">
                    Available Balance: {account.available_balance.value} {account.available_balance.currency}
                </p>
                <p className="text-sm text-gray-500">
                    Type: {account.type.replace('ACCOUNT_TYPE_', '')}
                </p>
                <p className="text-sm text-gray-500">
                    Status: {account.active ? 'Active' : 'Inactive'} / {account.ready ? 'Ready' : 'Not Ready'}
                </p>
                <p className="text-sm text-gray-500">
                    Created At: {new Date(account.created_at).toLocaleString()}
                </p>
            </div>
        ));
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
                {/* Exchange data section */}
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

                {/* Input fields for API Key and Secret */}
                <div className="my-6">
                    <h1 className="text-2xl font-bold text-gray-900">Enter Coinbase API Credentials</h1>
                    <input
                        type="text"
                        placeholder="API Key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="border p-2 mb-4 w-full"
                    />
                    <input
                        type="password"
                        placeholder="API Secret"
                        value={apiSecret}
                        onChange={(e) => setApiSecret(e.target.value)}
                        className="border p-2 mb-4 w-full"
                    />
                    <button
                        onClick={() => handleCoinbaseData()}
                        className="cursor-pointer text-lg font-bold border-2 border-solid border-black w-1/3 text-center hover:shadow-xl transition hover:-translate-y-1"
                    >
                        {loading ? "Fetching Coinbase Data..." : "Fetch Coinbase Data"}
                    </button>
                </div>

                {/* Display Coinbase data if available */}
                {coinbaseData && (
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 my-8">Coinbase Account Data</h1>
                        <div>{renderCoinbaseAccounts()}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExchangeDataPage;
