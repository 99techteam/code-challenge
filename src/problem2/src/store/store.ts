import { configureStore } from "@reduxjs/toolkit";
import type { Action } from "@reduxjs/toolkit";
import type { ThunkAction} from "@reduxjs/toolkit";
import { swapReducer } from "./swap/swapReducer";
import { TokenReducer } from "./token/tokenReducer";

export const store = configureStore({
  reducer: {
    token: TokenReducer,
    swap: swapReducer
  },
  devTools: true,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
