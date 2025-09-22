export enum SwapActionTypes {
  SET_FROM_TOKEN = "@@swap/SET_FROM_TOKEN",
  SET_TO_TOKEN = "@@swap/SET_TO_TOKEN",
  SET_AMOUNT = "@@swap/SET_AMOUNT",
  SET_RESULT = "@@swap/SET_RESULT",
}

export type SwapActions = 
| { type: SwapActionTypes.SET_FROM_TOKEN; payload: string }
| { type: SwapActionTypes.SET_TO_TOKEN; payload: string }
| { type: SwapActionTypes.SET_AMOUNT; payload: string }
| { type: SwapActionTypes.SET_RESULT; payload: string }