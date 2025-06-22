import { fetchTokens } from "@services/features/token/tokenSlice";
import { useAppDispatch, useAppSelector } from "@utils/hooks/redux-hooks";
import React, { useEffect, useState } from "react";

import { RootState } from "@app/store";
import AmountInput from "@components/AmountInput";
import ExchangeRate from "@components/ExchangeRate";
import { SwapButton } from "@components/SwapButton";
import TokenSelector from "@components/TokenSelector";
import { Button, Typography } from "@mui/material";
import { useTheme } from "@context/ThemeContext";

const SwapPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const tokens = useAppSelector((state: RootState) => state.token.tokens);
  const loading = useAppSelector((state: RootState) => state.token.isLoading);
  const error = useAppSelector((state: RootState) => state.token.error);

  const { theme } = useTheme();

  const [amount, setAmount] = useState<number>(0);
  const [fromToken, setFromToken] = useState<string>("USDC");
  const [toToken, setToToken] = useState<string>("USDC");
  const [isConverted, setIsConverted] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value);
    setAmount(!isNaN(parsed) ? parsed : 0);
  };

  const handleSwap = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const handleConvert = () => {
    if (fromToken && toToken && tokens.length > 0) {
      setIsConverted(true);
    }
  };

  const tokenOptions = tokens.map((coin) => ({
    value: coin.currency,
    label: coin.currency,
    logo: coin.logo,
  }));

  useEffect(() => {
    dispatch(fetchTokens());
  }, [dispatch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="w-full flex justify-center flex-col items-center">
      <div
        className="w-full p-[32px] flex flex-col gap-6 rounded-3xl mt-[30px]"
        style={{ backgroundColor: theme.colors.card }}
      >
        <div className="relative grid grid-cols-1 grid-rows-1 gap-2 md:grid-cols-[33%_1fr] md:grid-rows-[none]">
          {/* Amount input */}
          <AmountInput value={amount.toString()} onChange={handleChange} />

          {/* Token selectors with swap */}

          <div className="relative flex flex-col gap-2 md:flex-row h-[176px] md:h-[84px]">
            <TokenSelector
              options={tokenOptions}
              selectedValue={fromToken}
              onChange={(value) => setFromToken(value)}
              placeholder="From token"
              label="From"
              containerClassName="w-full"
              inputClassName="md:pr-[40px]"
            />

            <SwapButton
              onClick={handleSwap}
              className="absolute left-1/2 top-[calc(50%)] -translate-x-1/2 -translate-y-1/2 z-10"
            />

            <TokenSelector
              options={tokenOptions}
              selectedValue={toToken}
              onChange={(value) => setToToken(value)}
              placeholder="To token"
              label="To"
              containerClassName="w-full"
              inputClassName="md:pl-[40px]"
            />
          </div>
        </div>
        <div className="w-full flex flex-col md:flex-row justify-between gap-4">
          <div>
            {isConverted && (
              <ExchangeRate
                amount={amount}
                fromToken={fromToken}
                toToken={toToken}
                tokens={tokens}
              />
            )}
          </div>

          <div>
            <Button
              sx={{ backgroundColor: "#207fe6" }}
              className="h-[48px] w-[234px] rounded-lg px-6 py-3"
              onClick={handleConvert}
            >
              <Typography className="text-white text-[16px]">
                Convert
              </Typography>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SwapPage;
