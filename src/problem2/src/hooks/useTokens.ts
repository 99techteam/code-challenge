import { useCallback, useEffect, useReducer } from "react"

import { fetchTokens } from "@/lib/prices"
import type { Token } from "@/types/token"

type State = {
  tokens: Token[]
  isLoading: boolean
  error: string | null
  nonce: number
}

type Action =
  | { type: "reload" }
  | { type: "success"; tokens: Token[] }
  | { type: "failure"; error: string }

const initialState: State = {
  tokens: [],
  isLoading: true,
  error: null,
  nonce: 0,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "reload":
      return { ...state, isLoading: true, error: null, nonce: state.nonce + 1 }
    case "success":
      return { ...state, isLoading: false, error: null, tokens: action.tokens }
    case "failure":
      return { ...state, isLoading: false, error: action.error }
    default:
      return state
  }
}

type UseTokensState = {
  tokens: Token[]
  isLoading: boolean
  error: string | null
  reload: () => void
}

export function useTokens(): UseTokensState {
  const [state, dispatch] = useReducer(reducer, initialState)

  const reload = useCallback(() => dispatch({ type: "reload" }), [])

  useEffect(() => {
    const controller = new AbortController()

    fetchTokens(controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return
        dispatch({ type: "success", tokens: result })
      })
      .catch((err) => {
        if (controller.signal.aborted) return
        const message =
          err instanceof Error ? err.message : "Failed to load tokens"
        dispatch({ type: "failure", error: message })
      })

    return () => controller.abort()
  }, [state.nonce])

  return {
    tokens: state.tokens,
    isLoading: state.isLoading,
    error: state.error,
    reload,
  }
}
