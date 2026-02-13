import { useContext } from "react";
import { ToastContext } from "./context-definition";
import { ERROR_MESSAGES } from "@common";

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error(ERROR_MESSAGES.CONTEXT.TOAST_PROVIDER_REQUIRED);
  }
  return context;
};
