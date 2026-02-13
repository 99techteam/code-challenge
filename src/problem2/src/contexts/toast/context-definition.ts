import { createContext } from "react";

export interface ToastContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);
