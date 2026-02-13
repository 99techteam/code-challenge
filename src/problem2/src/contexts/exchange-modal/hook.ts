import { useContext } from "react";
import { ExchangeModalContext } from "./context-definition";
import { ERROR_MESSAGES } from "@common";

export const useExchangeModal = () => {
  const context = useContext(ExchangeModalContext);
  if (!context) {
    throw new Error(
      ERROR_MESSAGES.CONTEXT.EXCHANGE_MODAL_PROVIDER_REQUIRED,
    );
  }
  return context;
};