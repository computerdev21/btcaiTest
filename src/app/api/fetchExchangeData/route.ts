'use client';

import React, { useEffect, useState } from "react";
import axios from "axios";

// Define the types for exchanges
type ExchangeType = "ccxt" | "coinbase";

interface Exchange {
    name: string;
    id: string;
    type: ExchangeType;
}

// Modal component for exchange selection
interface ExchangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (exchange: Exchange) => void;
}

const ExchangeModal: React.FC<ExchangeModalProps> = ({ isOpen, onClose, onSelect }) => {
    const exchanges: Exchange[] = [
        { name: "Binance", id: "binance", type: "ccxt" },
        { name: "Bybit", id: "bybit", type: "ccxt" },
        { name: "OKX", id: "okx", type: "ccxt" },
        { name: "Bitget", id: "bitget", type: "ccxt" },
        { name: "Gate.io", id: "gateio", type: "ccxt" },
        { name: "BingX", id: "bingx", type: "ccxt" },
        { name: "Woo X", id: "woo", type: "ccxt" },
        { name: "BitMEX", id: "bitmex", type: "ccxt" },
        { name: "Deribit", id: "deribit", type: "ccxt" },
        { name: "Kraken", id: "kraken", type: "ccxt" },
        { name: "KuCoin", id: "kucoin", type: "ccxt" },
        { name: "MEXC", id: "mexc", type: "ccxt" },
        { name: "Huobi", id: "huobi", type: "ccxt" },
        { name: "Bitfinex", id: "bitfinex", type: "ccxt" },
        { name: "Coinbase", id: "coinbase", type: "coinbase" }, // Coinbase (non-Pro)
        { name: "Coinbase Pro", id: "coinbasepro", type: "ccxt" }, // Coinbase Pro via CCXT
        { name: "Phemex", id: "phemex", type: "ccxt" },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex justify-center items-center z-50">
        <div className="bg-white p-8 rounded-md shadow-lg max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Select Exchange</h2>
    <ul className="space-y-2 max-h-80 overflow-y-auto">
        {exchanges.map((exchange) => (
                <li key={exchange.id}>
                <button
                    className="w-full text-left p-2 hover:bg-gray-200 rounded-md"
            onClick={() => {
        onSelect(exchange);
        onClose();
    }}
>
    {exchange.name}
    </button>
    </li>
))}
    </ul>
    <button
    className="mt-4 p-2 bg-red-500 text-white rounded-md"
    onClick={onClose}
        >
        Close
        </button>
        </div>
        </div>
);
};

const ExchangeDataPage: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [coinbaseData, setCoinbaseData] = useState<any>(null); // Store Coinbase (non-Pro) data
    const [exchangeData, setExchangeData] = useState<any>(null); // Store CCXT-based exchange data
    const [loading, setLoading] = useState(false);
    const [apiKey, setApiKey] = useState<string>(''); // Store API Key
    const [apiSecret, setApiSecret] = useState<string>(''); // Store API Secret
    const [userId, setUserId] = useState<string>('user-123'); // Hardcoded userId for now

    const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
    const [selectedExchange, setSelectedExchange] = useState<Exchange>({ name: 'Select Exchange', id: '', type: "ccxt" }); // Store selected exchange

    // Fetch the exchange data (e.g., spot and futures data from various exchanges)
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
        const checkAndFetchData = async () => {
            try {
                // Fetch API secrets for the current user for CCXT-based exchanges
                const ccxtResponse = await axios.get(`/api/getExchangeSecrets?userId=${userId}&exchangeId=${selectedExchange.id}`);
                const { apiKey: ccxtApiKey, apiSecret: ccxtApiSecret } = ccxtResponse.data;

                if (ccxtApiKey && ccxtApiSecret && selectedExchange.type === "ccxt") {
                    setApiKey(ccxtApiKey);
                    setApiSecret(ccxtApiSecret);
                    await handleExchangeData(ccxtApiKey, ccxtApiSecret);
                }

                // If the selected exchange is Coinbase (non-Pro), fetch its secrets and data
                if (selectedExchange.type === "coinbase") {
                    const coinbaseResponse = await axios.get(`/api/coinbase/getSecrets?userId=${userId}`);
                    const { apiKey: coinbaseApiKey, apiSecret: coinbaseApiSecret } = coinbaseResponse.data;

                    if (coinbaseApiKey && coinbaseApiSecret) {
                        setApiKey(coinbaseApiKey);
                        setApiSecret(coinbaseApiSecret);
                        await handleCoinbaseData(coinbaseApiKey, coinbaseApiSecret);
                    }
                }
            } catch (error) {
                console.error("Error fetching saved API secrets:", error);
            }
        };

        if (selectedExchange.id !== '' && selectedExchange.name !== 'Select Exchange') {
            checkAndFetchData();
        }
    }, [userId, selectedExchange]);

    // Function to save API secrets to the backend for CCXT-based exchanges
    const saveExchangeSecrets = async (apiKey: string, apiSecret: string) => {
        try {
            await axios.post("/api/saveExchangeSecrets", {
                userId,
                exchangeId: selectedExchange.id,
                apiKey,
                apiSecret,
            });
            console.log("Secrets saved successfully!");
        } catch (error) {
            console.error("Error saving API secrets:", error);
        }
    };

    // Function to save API secrets to the backend for Coinbase (non-Pro)
    const saveCoinbaseSecrets = async (apiKey: string, apiSecret: string) => {
        try {
            await axios.post("/api/coinbase/saveSecrets", {
                userId,
                apiKey,
                apiSecret,
            });
            console.log("Coinbase secrets saved successfully!");
        } catch (error) {
            console.error("Error saving Coinbase secrets:", error);
        }
    };

    // Fetch CCXT-based exchange data using the API key and secret provided by the user
    const handleExchangeData = async (providedApiKey?: string, providedApiSecret?: string) => {
        if (!selectedExchange.id || selectedExchange.type !== "ccxt") {
            alert("Please select a valid CCXT-based exchange first.");
            return;
        }

        setLoading(true);
        const key = providedApiKey || apiKey;
        const secret = providedApiSecret || apiSecret;

        try {
            const response = await axios.post('/api/fetchExchangeData', {
                exchangeId: selectedExchange.id,
                apiKey: key,
                apiSecret: secret
            });
            setExchangeData(response.data); // Set CCXT-based exchange data

            // Save the API key and secret to the backend
            await saveExchangeSecrets(key, secret);
        } catch (error) {
            console.error("Error fetching exchange data:", error);
            alert("Failed to fetch exchange data. Please check your API credentials.");
        } finally {
            setLoading(false);
        }
    };

    // Fetch Coinbase (non-Pro) data using the API key and secret provided by the user
    const handleCoinbaseData = async (providedApiKey?: string, providedApiSecret?: string) => {
        if (selectedExchange.type !== "coinbase") {
            alert("Please select Coinbase first.");
            return;
        }

        setLoading(true);
        const key = providedApiKey || apiKey;
        const secret = providedApiSecret || apiSecret;

        try {
            const response = await axios.post('/api/fetchCoinbaseData', {
                apiKey: key,        // API Key entered by the user
                apiSecret: secret   // API Secret entered by the user
            });
            setCoinbaseData(response.data); // Set Coinbase data

            // Save the API key and secret to the backend
            await saveCoinbaseSecrets(key, secret);
        } catch (error) {
            console.error("Error fetching Coinbase data:", error);
            alert("Failed to fetch Coinbase data. Please check your API credentials.");
        } finally {
            setLoading(false);
        }
    };

    // Helper function to render Coinbase (non-Pro) account data
    const renderCoinbaseAccounts = () => {
        return coinbaseData?.accounts.map((account: any) => (
            <div
                key={account.id}
        className="border border-stone-300 rounded-lg p-4 flex flex-col hover:shadow-xl transition hover:-translate-y-1 mb-4"
        >
        <h2 className="text-xl font-semibold text-gray-900">
            {account.name} ({account.balance.currency})
            </h2>
            <p className="text-sm text-gray-500">
            Available Balance: {account.balance.amount} {account.balance.currency}
        </p>
        {/* Add more fields as needed */}
        </div>
    ));
    };

    // Helper function to render CCXT-based exchange account data
    const renderExchangeAccounts = () => {
        if (!exchangeData) return null;

        return exchangeData.balances.map((balance: any, index: number) => (
            <div
                key={index}
        className="border border-stone-300 rounded-lg p-4 flex flex-col hover:shadow-xl transition hover:-translate-y-1 mb-4"
        >
        <h2 className="text-xl font-semibold text-gray-900">
            {balance.asset}
            </h2>
            <p className="text-sm text-gray-500">
            Free: {balance.free}
        </p>
        <p className="text-sm text-gray-500">
            Used: {balance.used}
        </p>
        <p className="text-sm text-gray-500">
            Total: {balance.total}
        </p>
        </div>
    ));
    };

    if (!data) {
        return <div>Loading exchange data...</div>;
    }

    return (
        <div className="grainy min-h-screen" style={{ caretColor: 'transparent' }}>
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

    {/* Select Exchange button */}
    <button
        onClick={() => setIsModalOpen(true)}
    className="cursor-pointer text-lg font-bold border-2 border-solid border-black w-1/3 text-center hover:shadow-xl transition hover:-translate-y-1 mt-6"
        >
        Select Exchange (Current: {selectedExchange.name})
    </button>

    {/* Input fields for API Key and Secret */}
    <div className="my-6">
    <h1 className="text-2xl font-bold text-gray-900">
        Enter {selectedExchange.name !== 'Select Exchange' ? selectedExchange.name : "Exchange"} API Credentials
    </h1>
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
        onClick={() => {
        if (selectedExchange.type === "ccxt") {
            handleExchangeData();
        } else if (selectedExchange.type === "coinbase") {
            handleCoinbaseData();
        }
    }}
    className="cursor-pointer text-lg font-bold border-2 border-solid border-black w-1/3 text-center hover:shadow-xl transition hover:-translate-y-1"
    >
    {loading
        ? selectedExchange.type === "ccxt"
            ? "Fetching Data..."
            : "Fetching Coinbase Data..."
        : selectedExchange.type === "ccxt"
            ? `Fetch ${selectedExchange.name} Data`
            : `Fetch ${selectedExchange.name} Data`}
    </button>
    </div>

    {/* Display Coinbase (non-Pro) data if available */}
    {coinbaseData && selectedExchange.type === "coinbase" && (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 my-8">
            Coinbase Account Data
    </h1>
    <div>{renderCoinbaseAccounts()}</div>
    </div>
    )}

    {/* Display CCXT-based exchange data if available */}
    {exchangeData && selectedExchange.type === "ccxt" && (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 my-8">
            {selectedExchange.name} Account Data
    </h1>
    <div>{renderExchangeAccounts()}</div>
    </div>
    )}

    {/* Exchange selection modal */}
    <ExchangeModal
        isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    onSelect={(exchange) => {
        setSelectedExchange(exchange);
        setApiKey('');
        setApiSecret('');
        setExchangeData(null);
        setCoinbaseData(null);
    }}
    />
    </div>
    </div>
);
};

export default ExchangeDataPage;
