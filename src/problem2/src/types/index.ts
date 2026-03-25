export interface RawToken {
  currency: string;
  date: string;
  price: number;
}

export interface IToken {
  currency: string;
  date: Date;
  price: number;
  imageUrl: string;
}
