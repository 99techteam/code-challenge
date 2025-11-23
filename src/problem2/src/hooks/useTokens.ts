import { useSyncState } from '../hooks/useSyncState'
import type { Token } from '../utils/types'

export function useTokens(tokens: Token[]) {
  // Initialize defaults (fallback to empty object to prevent undefined errors)
  const [fromToken, setFromToken] = useSyncState<Token>(tokens[0] ?? null)
  const [toToken, setToToken] = useSyncState<Token>(tokens[1] ?? null)

  // Handy swap function
  const swapTokens = () => {
    setFromToken(toToken)
    setToToken(fromToken)
  }

  return {
    fromToken,
    setFromToken,
    toToken,
    setToToken,
    swapTokens
  }
}
