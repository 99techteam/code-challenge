export interface CurrencyState {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  priceData: { [key: string]: number };
  isLoading: boolean;
  error: string | null;
  setFromCurrency: (currency: string) => void;
  setToCurrency: (currency: string) => void;
  setAmount: (amount: number) => void;
  setPriceData: (data: { [key: string]: number }) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchPriceData: () => Promise<void>;
}
