export interface Token {
  currency: string;
  date: string;
  price: number;
}

export interface TokenWithIcon extends Token {
  iconUrl: string;
}
