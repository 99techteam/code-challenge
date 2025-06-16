import { QueryClient } from "@tanstack/react-query";

// Create a client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global query settings
      staleTime: 1 * 60 * 1000, // 1 minutes
      refetchOnWindowFocus: false, // Disable by default
      retry: 0,
    },
  },
});
