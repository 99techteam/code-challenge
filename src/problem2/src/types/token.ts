export interface IToken {
  currency: string;
  price: number;
  date: string;
  logo?: string;
  id?: number;
}

export interface ITokenList {
  coins: IToken[];
}

export interface ITokenSearchParams {
  q?: string;
  currency?: string;
  currency_like?: string;
  price_gte?: number;
  price_lte?: number;
  _sort?: "currency" | "price" | "date";
  _order?: "asc" | "desc";
  _limit?: number;
  _start?: number;
  _end?: number;
}
