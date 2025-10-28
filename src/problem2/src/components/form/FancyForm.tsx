import { useEffect, useState, useCallback } from "react";
import TokenDropdown from "../dropdown/TokenDropdown";
import { useFetch } from "../../hooks/useFetch";
import TokenIcon from "../icon/TokenIcon";
import type { TokenPrice } from "../../type/token";
import SampleConvert from "../SampleConvert";


interface ErrorMsg {
    isError: boolean;
    message: string;
}

const FancyForm = () => {
    const { data: tokens, loading: loadingTokens, error: errorTokens } = useFetch<TokenPrice[]>(
        "https://interview.switcheo.com/prices.json"
    );

    const [loadingConvert, setLoadingConvert] = useState<boolean>(false);
    const [errorConvert, setErrorConvert] = useState<ErrorMsg>({ isError: false, message: "" });

    const [fromToken, setFromToken] = useState<string>("");
    const [toToken, setToToken] = useState<string>("");
    const [amount, setAmount] = useState<number>(1);
    const [result, setResult] = useState<number | null>(null);

    const calculateConversion = useCallback(
        (from: string, to: string, amt: number) => {
            if (!tokens) return;

            // Validate input
            if (!from || !to) {
                setErrorConvert({ isError: true, message: "Please select both tokens." });
                setResult(null);
                return;
            }

            if (amt <= 0) {
                setErrorConvert({ isError: true, message: "Amount must be greater than 0." });
                setResult(null);
                return;
            }

            setLoadingConvert(true);
            try {
                const fromTokenData = tokens.find((t) => t.currency === from);
                const toTokenData = tokens.find((t) => t.currency === to);

                if (!fromTokenData || !toTokenData) {
                    setResult(null);
                    setErrorConvert({ isError: true, message: "Selected token not found." });
                    return;
                }

                const converted = amt * (toTokenData.price / fromTokenData.price);
                setResult(converted);
                setErrorConvert({ isError: false, message: "" });
            } catch (error: any) {
                setResult(null);
                setErrorConvert({ isError: true, message: error.message });
            } finally {
                setLoadingConvert(false);
            }
        },
        [tokens]
    );

    useEffect(() => {
        calculateConversion(fromToken, toToken, amount);
    }, [fromToken, toToken, amount, calculateConversion]);

    const handleConvert = () => {
        calculateConversion(fromToken, toToken, amount);
    };

    const handleSwapTokens = () => {
        setFromToken(toToken);
        setToToken(fromToken);
    };
    const handleMarketSelect = (from: string, to: string) => {
        setFromToken(from);
        setToToken(to);
        setAmount(1); // Set mặc định amount = 1 để xem tỷ giá
    };
    const handleAmountChange = (value: number) => {
        setAmount(value);
    };

    if (loadingTokens) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (errorTokens) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-500 text-xl font-semibold">
                    Failed to load tokens. Please try again later.
                </div>
            </div>
        );
    }

    if (!tokens) return null;

    const isConvertDisabled = !fromToken || !toToken || amount <= 0 || loadingConvert;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8 grid grid-cols-1 xl:grid-cols-2">
            <div className="max-w-sm mx-auto bg-white rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-100 transform hover:scale-[1.02] transition-all duration-300">
                <h1 className="text-center text-3xl font-bold p-5">Fancy Token Converter</h1>

                {errorConvert.isError && (
                    <p className="text-red-500 font-semibold text-center mb-4">{errorConvert.message}</p>
                )}

                {/* From Token */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                        From Token
                    </label>
                    <TokenDropdown tokens={tokens} selected={fromToken} onSelect={setFromToken} />
                </div>

                {/* Swap Button */}
                <div className="flex items-center justify-center my-2">
                    <div className="w-20 bg-gray-200 h-1 rounded-3xl mr-2"></div>
                    <button
                        onClick={handleSwapTokens}
                        disabled={!fromToken || !toToken}
                        className={`p-3 rounded-full transition-colors duration-200 transform hover:rotate-180 ${!fromToken || !toToken
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                            />
                        </svg>
                    </button>
                    <div className="w-20 bg-gray-200 h-1 rounded-3xl ml-2"></div>
                </div>

                {/* To Token */}
                <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                        To Token
                    </label>
                    <TokenDropdown tokens={tokens} selected={toToken} onSelect={setToToken} />
                </div>

                {/* Amount Input */}
                <div className="mb-8">
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
                        Amount
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            min="0"
                            step="any"
                            className="w-full border-2 border-gray-200 px-4 py-4 rounded-xl text-lg font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                            value={amount}
                            onChange={(e) => handleAmountChange(Number(e.target.value))}
                            placeholder="Enter amount..."
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            {fromToken && <TokenIcon token={fromToken} />}
                        </div>
                    </div>
                </div>

                {/* Convert Button */}
                <button
                    onClick={handleConvert}
                    disabled={isConvertDisabled}
                    className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform hover:scale-[1.02] ${isConvertDisabled
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg"
                        }`}
                >
                    {loadingConvert ? "Converting..." : "Convert Now"}
                </button>

                {/* Result */}
                {result !== null && !loadingConvert && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 animate-fade-in">
                        <div className="text-center">
                            <p className="text-gray-600 text-sm font-semibold mb-2">CONVERSION RESULT</p>
                            <div className="flex items-center justify-center space-x-3 text-2xl font-bold text-gray-800">
                                <div className="flex items-center space-x-2">
                                    <span>{amount}</span>
                                    <TokenIcon token={fromToken} />
                                    <span className="text-lg">{fromToken}</span>
                                </div>
                                <span className="text-gray-400">=</span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-green-600">{result.toFixed(6)}</span>
                                    <TokenIcon token={toToken} />
                                    <span className="text-lg">{toToken}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <SampleConvert onMarketSelect={handleMarketSelect} />
        </div>
    );
};

export default FancyForm;
