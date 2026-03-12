interface Token {
  symbol: string;
  name: string;
  balance: number;
  price: number;
}

interface PriceData {
  currency: string;
  date: string;
  price: number;
}

export type { Token, PriceData };
