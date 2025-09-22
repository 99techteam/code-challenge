import { PriceService } from "../../services/priceService";
import type { AppThunk } from "../store";
import type { Token } from "./tokenState";

export enum TokenActionTypes {
  FETCH_TOKEN = "@@token/FETCH",
  ERROR = "@@token/ERROR",
}

export type TokenActions =
  | { type: TokenActionTypes.FETCH_TOKEN; payload: Token[] }
  | { type: TokenActionTypes.ERROR; payload: string };

export const fetchTokens = (): AppThunk => async (dispatch) => {
  try {
    const prices = await PriceService.fetchPrices();
    const tokens: Token[] = prices.map((p) => ({
      name: p.currency,
      price: p.price,
      icon: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${p.currency}.svg`
    }));

    return dispatch({
      type: TokenActionTypes.FETCH_TOKEN,
      payload: tokens,
    });
  } catch (e) {
    return dispatch({
      type: TokenActionTypes.ERROR,
      payload: null,
    });
  }
};
