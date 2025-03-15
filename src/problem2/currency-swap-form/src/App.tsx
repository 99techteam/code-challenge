import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Select, { CSSObjectWithLabel, OptionProps, SingleValue, components } from "react-select";
import "./App.css";

const GET_LIST_TOKEN_INFO_URL = "https://interview.switcheo.com/prices.json"
const GET_IMG_TOKEN_URL = "https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/"

interface Token {
  value: string;
  label: string;
  icon: string;
  price: number;
}

interface TokenData {
  currency: string;
  price: number;
}

const App = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [fromToken, setFromToken] = useState<SingleValue<Token>>(null);
  const [toToken, setToToken] = useState<SingleValue<Token>>(null);
  const [amount, setAmount] = useState<string>("");
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [calculationLoading, setCalculationLoading] = useState<boolean>(false);

  const fetchTokens = useCallback(async () => {
    try {
      const response = await axios.get(GET_LIST_TOKEN_INFO_URL);
      const priceData: Record<string, TokenData> = response.data;
      const tokenList: Token[] = Object.keys(priceData).map((token) => {
        const tokenData = priceData[token];
        const initialIconUrl = `${GET_IMG_TOKEN_URL}${tokenData.currency}.svg`;
        return {
          value: tokenData.currency,
          label: tokenData.currency,
          icon: initialIconUrl,
          price: tokenData.price,
        };
      });

      setTokens(tokenList);
      if (tokenList.length > 0) {
        setFromToken(tokenList[0]);
        setToToken(tokenList[1]);
      }
    } catch (error) {
      console.error(error)
    }
  }, []);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const calculateSwap = useCallback(async () => {
    if (!fromToken?.price || !toToken?.price || !amount) {
      setConvertedAmount(null);
      return;
    }
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setConvertedAmount(null);
      return;
    }
    setConvertedAmount(null);
    setCalculationLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const result = (amountNum * fromToken.price) / toToken.price; setConvertedAmount(parseFloat(result.toFixed(6)));
    setCalculationLoading(false);
  }, [fromToken, toToken, amount]);

  useEffect(() => {
    if (fromToken && toToken && amount) {
      calculateSwap();
    }
  }, [fromToken, toToken, amount, calculateSwap]);

  const handleSwapDirection = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setConvertedAmount(null);
    setAmount("");
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, data) => {
    const formattedToken = data.label.charAt(0).toLowerCase() + data.label.slice(1);
    e.currentTarget.src = `${GET_IMG_TOKEN_URL}${formattedToken}.svg`;
    e.currentTarget.onerror = (e) => {
      const formattedToken2 = data.label.substring(0, 2).toLowerCase() + data.label.slice(2);
      e.currentTarget.src = `${GET_IMG_TOKEN_URL}${formattedToken2}.svg`;
      return;
    };
  };

  const CustomOption = (props: OptionProps<Token, false>) => {
    const { data } = props;
    return (
      <components.Option {...props}>
        <div className="flex items-center p-2 hover:bg-gray-700 cursor-pointer">
          <img
            src={data.icon}
            alt={data.label}
            className="w-6 h-6 mr-2"
            onError={(e) => handleImageError(e, data)}
            loading="lazy"
          />
          <span className="text-white">{data.label}</span>
        </div>
      </components.Option>
    );
  };

  const CustomSingleValue = (props: OptionProps<Token, false>) => {
    const { data } = props;
    return (
      <components.SingleValue {...props}>
        <div className="flex items-center">
          <img
            src={data.icon}
            alt={data.label}
            className="w-6 h-6 mr-2"
            onError={(e) => handleImageError(e, data)}
            loading="lazy"
          />
          <span className="text-white">{data.label}</span>
        </div>
      </components.SingleValue>
    );
  };

  const selectStyles = {
    control: (base: CSSObjectWithLabel): CSSObjectWithLabel => ({
      ...base,
      background: "rgba(255, 255, 255, 0.05)",
      borderColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: "8px",
      padding: "4px",
      color: "white",
      "&:hover": {
        borderColor: "#22d3ee",
      },
    }),
    singleValue: (base: CSSObjectWithLabel): CSSObjectWithLabel => ({
      ...base,
      color: "white",
    }),
    menu: (base: CSSObjectWithLabel): CSSObjectWithLabel => ({
      ...base,
      background: "#1e293b",
      borderRadius: "8px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    }),
    option: (base: CSSObjectWithLabel): CSSObjectWithLabel => ({
      ...base,
      background: "transparent",
      color: "white",
    }),
    input: (base: CSSObjectWithLabel): CSSObjectWithLabel => ({
      ...base,
      color: "white",
    }),
    dropdownIndicator: (base: CSSObjectWithLabel): CSSObjectWithLabel => ({
      ...base,
      color: "rgba(255, 255, 255, 0.5)",
      "&:hover": {
        color: "#22d3ee",
      },
    }),
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white">Crypto currency converter</h1>
        <p className="text-gray-400 mt-5">Check live crypto currency exchange rates</p>
      </div>

      <div className="converter-container">
        <form className="space-y-4">
          {/* Amount Section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onKeyDown={(event) => {
                if (!/[0-9]/.test(event.key)) {
                  event.preventDefault();
                }
              }}
              onPaste={(event) => {
                if (!/[0-9]/.test(event.target.value)) {
                  event.preventDefault();
                }
              }}
              placeholder="0.0"
              className="w-full"
              disabled={loading}
              min="0"
              step="0.000001"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">From</label>
              <Select
                options={tokens}
                value={fromToken}
                onChange={(option) => setFromToken(option)}
                components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
                styles={selectStyles}
                isDisabled={loading}
                placeholder="Select token"

              />
            </div>
            <button
              type="button"
              onClick={handleSwapDirection}
              disabled={loading}
              className="mt-6 p-2 rounded-full bg-gray-600 hover:bg-gray-500 disabled:opacity-50 transition-colors"
              aria-label="Swap direction"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m-12 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">To</label>
              <Select
                options={tokens}
                value={toToken}
                onChange={(option) => setToToken(option)}
                components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
                styles={selectStyles}
                isDisabled={loading}
                placeholder="Select token"
              />
            </div>
          </div>

          {amount && fromToken && toToken &&
            (calculationLoading ? (
              <div className="text-sm text-gray-400 text-center flex items-center justify-center gap-2 min-h-[100px]">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Calculating...
              </div>
            ) : <>{
              !calculationLoading && convertedAmount !== null && toToken && fromToken && (
                <div className="mt-4 flex flex-col gap-2 min-h-[100px]">
                  <p className="text-sm text-gray-400 animate-fade-in">
                    {amount} {fromToken?.label} =
                  </p>
                  <p className="text-2xl text-gray-400 animate-fade-in">
                    {convertedAmount} {toToken.label}
                  </p>


                  {fromToken?.price && toToken?.price && !calculationLoading && (
                    <div className="flex flex-col gap-1">
                      <p className="text-xs text-gray-400">
                        1  {toToken.label} = {(fromToken.price / toToken.price).toFixed(6)} {fromToken.label}
                      </p>
                      <p className="text-xs text-gray-400">
                        1 {fromToken.label} = {(toToken.price / fromToken.price).toFixed(6)} {toToken.label}
                      </p>
                    </div>
                  )}
                </div>
              )}</>)
          }
        </form>
      </div>
    </div>
  );
};

export default App;