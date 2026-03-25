import { useReducer } from 'react'

import type { IToken } from '@/types'
import { calculateToken } from '@/utils'

type TokenState = {
  fromToken: IToken | null
  tokenSend: number
  toToken: IToken | null
  tokenReceive: number
}

type Action =
  | { type: "SET_FROM_TOKEN"; payload: IToken }
  | { type: "SET_TO_TOKEN"; payload: IToken }
  | { type: "SET_TOKEN_SEND"; payload: number }
  | { type: "SET_TOKEN_RECEIVE"; payload: number }
  | { type: "SWAP_TOKENS" }

function swapState(state: TokenState): TokenState {
  return {
    ...state,
    fromToken: state.toToken,
    toToken: state.fromToken,
    tokenSend: state.tokenReceive,
    tokenReceive: state.tokenSend,
  }
}

function reducer(state: TokenState, action: Action): TokenState {
  switch (action.type) {
    case "SET_FROM_TOKEN": {
      if (action.payload.currency === state.toToken?.currency) {
        return swapState(state)
      }

      const newState = { ...state, fromToken: action.payload }

      if (newState.fromToken && newState.toToken) {
        newState.tokenReceive = calculateToken(
          newState.tokenSend,
          newState.fromToken,
          newState.toToken,
        )
      }

      return newState
    }
    case "SET_TO_TOKEN": {
      if (action.payload.currency === state.fromToken?.currency) {
        return swapState(state)
      }

      const newState = { ...state, toToken: action.payload }

      if (newState.fromToken && newState.toToken) {
        newState.tokenReceive = calculateToken(
          newState.tokenSend,
          newState.fromToken,
          newState.toToken,
        )
      }

      return newState
    }
    case "SET_TOKEN_SEND": {
      const newState = { ...state, tokenSend: action.payload }

      if (newState.fromToken && newState.toToken) {
        newState.tokenReceive = calculateToken(
          newState.tokenSend,
          newState.fromToken,
          newState.toToken,
        )
      }

      return newState
    }

    case "SET_TOKEN_RECEIVE": {
      const newState = { ...state, tokenReceive: action.payload }

      if (newState.fromToken && newState.toToken) {
        newState.tokenSend = calculateToken(
          newState.tokenReceive,
          newState.toToken,
          newState.fromToken,
        )
      }

      return newState
    }

    case "SWAP_TOKENS":
      return swapState(state)

    default:
      return state
  }
}

const DEFAULT_STATE = {
  fromToken: null,
  tokenSend: 0,
  toToken: null,
  tokenReceive: 0,
}

export function useSwapTokens() {
  return useReducer(reducer, DEFAULT_STATE)
}
