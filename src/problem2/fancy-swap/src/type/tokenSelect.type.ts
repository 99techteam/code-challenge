export interface TokenOption {
  value: string;
  label: string;
}

export interface PriceItem {
  currency: string;
  date: string;
  price: number;
}

export interface Prices {
  [currency: string]: number;
}
