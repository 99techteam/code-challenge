import type { Reducer } from "redux";
import { initialState, type SwapState } from "./swapState";
import { SwapActionTypes, type SwapActions } from "./swapAction";
import type { Token } from "../token/tokenState";

export const swapReducer: Reducer<SwapState> = (
  state = initialState,
  action
) => {
  action = action as SwapActions;

  switch (action.type) {
    case SwapActionTypes.SET_FROM_TOKEN: {
      return { ...state, fromToken: { ...action.payload as Token } };
    }
    case SwapActionTypes.SET_TO_TOKEN: {
      return { ...state, toToken: { ...action.payload as Token } };
    }
    case SwapActionTypes.SET_AMOUNT: {
      return { ...state, amount: action.payload as number };
    }
    case SwapActionTypes.SET_RESULT: {
      return { ...state, result: action.payload as number };
    }
    default: {
      return state;
    }
  }
};
