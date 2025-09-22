export interface Token {
  name: string;
  price: number;
  icon: string;
}

export interface TokenState {
  readonly data: Token[];
}

export const initialState: TokenState = {
  data: {} as Token[],
};