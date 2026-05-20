export type ITokenDTO = {
  currency: string;
  price: number;
  date: string;
};

export type TypeToken = {
  iconURL: string;
} & ITokenDTO;
