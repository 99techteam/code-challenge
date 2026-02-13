import { createContext } from "react";

export interface ExchangeModalContextType {
  isOpen: boolean;
  selectedCurrency: string | null;
  openModal: (currency?: string) => void;
  closeModal: () => void;
}

export const ExchangeModalContext = createContext<
  ExchangeModalContextType | undefined
>(undefined);
