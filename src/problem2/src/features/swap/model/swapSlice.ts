import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

import type { Token } from "@/data/tokens"
import type { SwapState } from "./types"

const initialState: SwapState = {
  fromToken: null,
  toToken: null,
  fromAmount: "",
}

export const swapSlice = createSlice({
  name: "swap",
  initialState,
  reducers: {
    setFromToken: (state, action: PayloadAction<Token | null>) => {
      state.fromToken = action.payload
    },
    setToToken: (state, action: PayloadAction<Token | null>) => {
      state.toToken = action.payload
    },
    setFromAmount: (state, action: PayloadAction<string>) => {
      state.fromAmount = action.payload
    },
    switchTokens: (state) => {
      const nextFromToken = state.toToken
      state.toToken = state.fromToken
      state.fromToken = nextFromToken
    },
  },
})

export const { setFromToken, setToToken, setFromAmount, switchTokens } =
  swapSlice.actions

export default swapSlice.reducer
