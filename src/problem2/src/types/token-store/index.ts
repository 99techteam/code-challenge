export interface TokenPrice {
  symbol: string;
  price: number;
  logoURI: string;
}

export interface TokenStore {
  tokens: TokenPrice[];
  loading: boolean;
  fetchTokens: () => Promise<void>;
}
