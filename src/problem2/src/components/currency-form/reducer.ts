import { computeAmount } from '@/utils/money';

export interface SwapState {
  fromAmount: string;
  fromName: string;
  fromPrice: number;
  toAmount: string;
  toName: string;
  toPrice: number;
}

export type SwapAction =
  | { type: 'SET_FROM_CURRENCY'; name: string; price: number }
  | { type: 'SET_TO_CURRENCY'; name: string; price: number }
  | { type: 'SET_FROM_AMOUNT'; fromAmount: string }
  | { type: 'SET_TO_AMOUNT'; toAmount: string }
  | { type: 'SWAP' };

export const initialState: SwapState = {
  fromAmount: '',
  fromName: '',
  fromPrice: 0,
  toAmount: '',
  toName: '',
  toPrice: 0,
};

export function swapReducer(state: SwapState, action: SwapAction): SwapState {
  switch (action.type) {
    case 'SET_FROM_CURRENCY': {
      const fromAmount = parseFloat(state.fromAmount.replace(/,/g, ''));
      return {
        ...state,
        fromName: action.name,
        fromPrice: action.price,
        toAmount: computeAmount(fromAmount, action.price, state.toPrice),
      };
    }
    case 'SET_TO_CURRENCY': {
      const fromAmount = parseFloat(state.fromAmount.replace(/,/g, ''));
      return {
        ...state,
        toName: action.name,
        toPrice: action.price,
        toAmount: computeAmount(fromAmount, state.fromPrice, action.price),
      };
    }
    case 'SET_FROM_AMOUNT': {
      const amount = parseFloat(action.fromAmount.replace(/,/g, ''));
      return {
        ...state,
        fromAmount: action.fromAmount,
        toAmount: computeAmount(amount, state.fromPrice, state.toPrice),
      };
    }
    case 'SET_TO_AMOUNT': {
      const amount = parseFloat(action.toAmount.replace(/,/g, ''));
      return {
        ...state,
        toAmount: action.toAmount,
        fromAmount: computeAmount(amount, state.toPrice, state.fromPrice),
      };
    }
    case 'SWAP':
      return {
        fromAmount: state.toAmount,
        fromName: state.toName,
        fromPrice: state.toPrice,
        toAmount: state.fromAmount,
        toName: state.fromName,
        toPrice: state.fromPrice,
      };
  }
}
