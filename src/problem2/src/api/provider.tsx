import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./client";

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * React Query Provider Component
 * Wrap your app with this component to enable React Query
 */
export const QueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
