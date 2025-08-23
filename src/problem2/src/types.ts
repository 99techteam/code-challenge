export interface Currency {
    currency: string;
    date:     Date;
    price:    number;
}

export interface CurrencyPrice {
    currency: string;
    amount:    number;
    price:    number;
}

export interface CurrencySwapState {
    fromCurrency: CurrencyPrice | null;
    toCurrency: CurrencyPrice | null;
    updateFromCurrency: (by: CurrencyPrice) => void;
    updateToCurrency: (by: CurrencyPrice) => void;
    swapCurrencies: () => void;
  }
