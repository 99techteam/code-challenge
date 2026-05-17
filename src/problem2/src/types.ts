export type Token = {
  symbol: string;   // "ETH", "USDC", ...
  price: number;    // USD per 1 token
  iconUrl: string;  // remote SVG URL
};

export type PriceEntry = {
  currency: string;
  date: string;     // ISO 8601
  price: number;
};

export type SwapState = {
  fromToken: Token | null;
  toToken: Token | null;
  fromAmount: string;
  toAmount: string;
  lastEdited: "from" | "to";
  touched: { from: boolean; to: boolean };
  status: "idle" | "submitting";
};

export type ValidationErrors = {
  fromToken?: string;
  toToken?: string;
  fromAmount?: string;
  pair?: string;
};

export type ValidationResult = {
  errors: ValidationErrors;
  isValid: boolean;
  firstError: string | null;
};
