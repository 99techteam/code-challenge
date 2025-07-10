import { type Token } from "@/services";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { type SwapFormData } from "@/schemas/swapSchema";

export interface SwapCardConfig {
  title: string;
  token: Token | null;
  amount: string;
  onAmountChange: (amount: string) => void;
  onTokenSelect: (token: Token) => void;
  showMax: boolean;
  onMaxClick?: () => void;
  register: ReturnType<UseFormRegister<SwapFormData>>;
  error?: string;
  className?: string;
}

export function createSwapCardConfigs(
  sellToken: Token | null,
  buyToken: Token | null,
  sellAmount: string,
  buyAmount: string,
  handleAmountChange: (amount: string, type: "sell" | "buy") => void,
  handleTokenSelect: (token: Token, type: "sell" | "buy") => void,
  handleMaxClick: () => void,
  register: UseFormRegister<SwapFormData>,
  errors: FieldErrors<SwapFormData>
): SwapCardConfig[] {
  return [
    {
      title: "You sell",
      token: sellToken,
      amount: sellAmount,
      onAmountChange: (amount: string) => handleAmountChange(amount, "sell"),
      onTokenSelect: (token: Token) => handleTokenSelect(token, "sell"),
      showMax: true,
      onMaxClick: handleMaxClick,
      register: register("sellAmount"),
      error: errors.sellAmount?.message,
    },
    {
      title: "You buy",
      token: buyToken,
      amount: buyAmount,
      onAmountChange: (amount: string) => handleAmountChange(amount, "buy"),
      onTokenSelect: (token: Token) => handleTokenSelect(token, "buy"),
      showMax: false,
      onMaxClick: undefined,
      register: register("buyAmount"),
      error: errors.buyAmount?.message,
      className: "border-2 border-teal-400/50 bg-gray-800/90 shadow-teal-400/10",
    },
  ];
}
