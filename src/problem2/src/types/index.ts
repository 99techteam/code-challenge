export type Token = {
  symbol: string;
  name: string;
  price: number;
  icon: string;
};

export type TokenPrice = {
  currency: string;
  date: string;
  price: number;
};

export type SwapState = {
  tokens: Token[];
  prices: Record<string, number>;
  selectedDirection: 'from' | 'to';
  loadingPrices: boolean;
};

export type ToastType = 'success' | 'error';