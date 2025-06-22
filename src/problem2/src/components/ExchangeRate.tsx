import React from "react";
import { Typography } from "@mui/material";
import { convertPrice } from "@utils/convertToken";
import { IToken } from "@types/token";

interface ExchangeRateProps {
  amount: number;
  fromToken: string;
  toToken: string;
  tokens: IToken[];
}

// Common styles for Typography components
const typographyStyles = {
    textAlign: "left",
    maxWidth: "100%",
    wordWrap: "break-word",
    overflowWrap: "break-word",
};

const ExchangeRate: React.FC<ExchangeRateProps> = ({
  amount,
  fromToken,
  toToken,
  tokens,
}) => {
  const convertedAmount = convertPrice(amount, fromToken, toToken, tokens);
  const exchangeRateFromTo = convertPrice(1, fromToken, toToken, tokens);
  const exchangeRateToFrom = convertPrice(1, toToken, fromToken, tokens);

  return (
    <div className="w-full flex flex-col grow items-start">
      <Typography
        sx={{
          ...typographyStyles,
          ...{ fontSize: "16px", fontWeight: 600, color: "#5c667b" },
        }}
      >
        {amount} {fromToken} =
      </Typography>

      <Typography
        sx={{
          ...typographyStyles,
          ...{ fontSize: "30px", fontWeight: 600, color: "#2e3c57" },
        }}
      >
        {convertedAmount !== null
          ? `${convertedAmount.toFixed(6)} ${toToken}`
          : "Conversion Error"}
      </Typography>

      <Typography
        sx={{
          ...typographyStyles,
          ...{ fontSize: "14px", color: "#5c667b" },
        }}
      >
        1 {fromToken} ={" "}
        {exchangeRateFromTo !== null ? exchangeRateFromTo.toFixed(6) : "-"}{" "}
        {toToken}
      </Typography>

      <Typography
        sx={{
          ...typographyStyles,
          ...{ fontSize: "14px", color: "#5c667b" },
        }}
      >
        1 {toToken} ={" "}
        {exchangeRateToFrom !== null ? exchangeRateToFrom.toFixed(6) : "-"}{" "}
        {fromToken}
      </Typography>
    </div>
  );
};

export default ExchangeRate;
