import { useReducer } from "react";
import type { SwapState, Token } from "../types";
import { convert } from "../lib/swap";
import { formatAmount, sanitizeAmount } from "../lib/tokens";

export type SwapAction =
  | { type: "SET_FROM_TOKEN"; token: Token }
  | { type: "SET_TO_TOKEN"; token: Token }
  | { type: "SET_FROM_AMOUNT"; value: string }
  | { type: "SET_TO_AMOUNT"; value: string }
  | { type: "BLUR_FROM" }
  | { type: "BLUR_TO" }
  | { type: "FLIP" }
  | { type: "SUBMIT_START" }
  | { type: "RESET" };

export function initialSwapState(
  fromToken: Token | null,
  toToken: Token | null,
): SwapState {
  return {
    fromToken,
    toToken,
    fromAmount: "",
    toAmount: "",
    lastEdited: "from",
    touched: { from: false, to: false },
    status: "idle",
  };
}

function rederive(s: SwapState): { fromAmount: string; toAmount: string } {
  const { fromToken, toToken, fromAmount, toAmount, lastEdited } = s;

  if (lastEdited === "from") {
    if (!fromToken || !toToken || fromAmount === "") {
      return { fromAmount, toAmount: "" };
    }
    const n = parseFloat(fromAmount);
    if (!Number.isFinite(n) || n === 0) {
      return { fromAmount, toAmount: "0" };
    }
    const out = convert(n, fromToken.price, toToken.price);
    return { fromAmount, toAmount: formatAmount(out) };
  } else {
    if (!fromToken || !toToken || toAmount === "") {
      return { fromAmount: "", toAmount };
    }
    const n = parseFloat(toAmount);
    if (!Number.isFinite(n) || n === 0) {
      return { fromAmount: "0", toAmount };
    }
    const out = convert(n, toToken.price, fromToken.price);
    return { fromAmount: formatAmount(out), toAmount };
  }
}

export function swapReducer(state: SwapState, action: SwapAction): SwapState {
  switch (action.type) {
    case "SET_FROM_AMOUNT": {
      const value = sanitizeAmount(action.value);
      const next: SwapState = {
        ...state,
        fromAmount: value,
        lastEdited: "from",
      };
      const { toAmount } = rederive(next);
      return { ...next, toAmount };
    }
    case "SET_TO_AMOUNT": {
      const value = sanitizeAmount(action.value);
      const next: SwapState = {
        ...state,
        toAmount: value,
        lastEdited: "to",
      };
      const { fromAmount } = rederive(next);
      return { ...next, fromAmount };
    }
    case "SET_FROM_TOKEN": {
      const next: SwapState = { ...state, fromToken: action.token };
      const { fromAmount, toAmount } = rederive(next);
      return { ...next, fromAmount, toAmount };
    }
    case "SET_TO_TOKEN": {
      const next: SwapState = { ...state, toToken: action.token };
      const { fromAmount, toAmount } = rederive(next);
      return { ...next, fromAmount, toAmount };
    }
    case "FLIP": {
      return {
        ...state,
        fromToken: state.toToken,
        toToken: state.fromToken,
        fromAmount: state.toAmount,
        toAmount: state.fromAmount,
        lastEdited: state.lastEdited === "from" ? "to" : "from",
      };
    }
    case "BLUR_FROM":
      return { ...state, touched: { ...state.touched, from: true } };
    case "BLUR_TO":
      return { ...state, touched: { ...state.touched, to: true } };
    case "SUBMIT_START":
      return { ...state, status: "submitting" };
    case "RESET":
      return {
        ...state,
        fromAmount: "",
        toAmount: "",
        touched: { from: false, to: false },
        status: "idle",
      };
    default:
      return state;
  }
}

export function useSwapReducer(
  fromToken: Token | null,
  toToken: Token | null,
) {
  return useReducer(swapReducer, initialSwapState(fromToken, toToken));
}
