export interface Coin {
  id: number;
  currency: string;
  blockchain: string;
  price: number;
  date: string;
  iconFilename: string;
}

export interface Score {
  username: string;
  score: number;
}

export interface AuthSession {
  username: string;
  token: string;
}
