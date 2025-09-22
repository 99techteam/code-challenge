import type { Reducer } from "redux";
import { initialState, type Token, type TokenState } from "./tokenState";
import { TokenActionTypes, type TokenActions } from "./tokenAction";

export const TokenReducer: Reducer<TokenState> = (
  state = initialState,
  action
) => {
  action = action as TokenActions;

  switch (action.type) {
    case TokenActionTypes.FETCH_TOKEN: {
      return { ...state, loading: false, data: action.payload as Token[] };
    }
    case TokenActionTypes.ERROR: {
      return { ...state, loading: false, errors: action.payload as string };
    }
    default: {
      return state;
    }
  }
};
