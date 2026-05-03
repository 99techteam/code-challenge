import { useDispatch, useSelector } from "react-redux"

import type { Token } from "@/data/tokens"
import { selectSwapState } from "@/features/swap/model/selectors"
import {
  setFromAmount,
  setFromToken,
  setToToken,
  switchTokens,
} from "@/features/swap/model/swapSlice"
import { calculateReceiveAmount } from "@/features/swap/services/quoteCalculator"

export const useSwapForm = () => {
  const dispatch = useDispatch()
  const { fromToken, toToken, fromAmount } = useSelector(selectSwapState)
  const toAmount = calculateReceiveAmount({ amount: fromAmount, fromToken, toToken })

  return {
    fromToken,
    toToken,
    fromAmount,
    toAmount,
    setFromToken: (token: Token | null) => dispatch(setFromToken(token)),
    setToToken: (token: Token | null) => dispatch(setToToken(token)),
    setFromAmount: (amount: string) => dispatch(setFromAmount(amount)),
    switchTokens: () => dispatch(switchTokens()),
  }
}
