export type TokenType = {
  symbol: string;
  name: string;
};

export type TokenPriceType = {
  currency: string;
  price: number;
  date: string;
};


export type WalletType = {
  currency: string;
  amount: number;
}