import { QueryClient } from "@tanstack/react-query";
import type { AxiosError, AxiosInstance } from "axios";
import axios, { HttpStatusCode } from "axios";
import {
  MAX_RETRIES,
  MAX_TIMEOUT,
  PRICE_API_URL,
  SECOND_TO_MILLISECONDS,
} from "@common";

const EXPONENTIAL_BASE = 2;

// Type guard for AxiosError
const isAxiosError = (error: unknown): error is AxiosError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as AxiosError).isAxiosError === true
  );
};

export const priceClient: AxiosInstance = axios.create({
  baseURL: PRICE_API_URL,
  timeout: MAX_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global retry strategy
      retry: (failureCount: number, error: unknown) => {
        // Type-safe error check
        if (!isAxiosError(error)) {
          return failureCount < MAX_RETRIES;
        }

        const status = error.response?.status;

        // Don't retry on client errors (4xx)
        if (
          status &&
          status >= HttpStatusCode.BadRequest &&
          status < HttpStatusCode.InternalServerError
        ) {
          return false;
        }

        // Retry on 5xx errors and network errors
        return failureCount < MAX_RETRIES;
      },
      // Exponential backoff: 1s, 2s, 4s, ... (capped at MAX_TIMEOUT)
      retryDelay: (attemptIndex: number) =>
        Math.min(
          SECOND_TO_MILLISECONDS * EXPONENTIAL_BASE ** attemptIndex,
          MAX_TIMEOUT,
        ),
    },
  },
});
