import type { Token } from "@/data/tokens"

export interface SwapState {
  fromToken: Token | null
  toToken: Token | null
  fromAmount: string
}
