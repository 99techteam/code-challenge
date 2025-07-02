export interface TokenInfo {
  symbol: string;
  logoURI: string;
  name?: string;
  price: number;
  currency?: string;
}

export interface TokenSelectProps {
  value: TokenInfo | null;
  onChange: (token: TokenInfo) => void;
  tokens: TokenInfo[];
  placeholder?: string;
}
