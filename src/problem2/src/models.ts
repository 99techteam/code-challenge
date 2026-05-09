export type TCurrency =
  | "BLUR"
  | "bNEO"
  | "BUSD"
  | "USD"
  | "ETH"
  | "GMX"
  | "STEVMOS"
  | "LUNA"
  | "RATOM"
  | "STRD"
  | "EVMOS"
  | "IBCX"
  | "IRIS"
  | "ampLUNA"
  | "KUJI"
  | "STOSMO"
  | "USDC"
  | "axlUSDC"
  | "ATOM"
  | "STATOM"
  | "OSMO"
  | "rSWTH"
  | "STLUNA"
  | "LSI"
  | "OKB"
  | "OKT"
  | "SWTH"
  | "USC"
  | "WBTC"
  | "wstETH"
  | "YieldUSD"
  | "ZIL"
  | (string & {});

export type TPrice = {
  currency: TCurrency;
  date: string;
  price: number;
};

export type TFormValues = {
  from?: string;
  to?: string;
  amountIn: string;
  data: Array<Omit<TPrice, "date"> & { date: number }>;
  isSubmitting: boolean;
};
