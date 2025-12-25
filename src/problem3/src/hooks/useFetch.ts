/**
 * Generic hook for fetching data from APIs or mock sources
 * Handles loading states, errors, and request cancellation
 */

import { useState, useEffect, useRef } from 'react';

export interface UseFetchOptions<T> {
  /**
   * Function that fetches the data
   * Can be a real API call or a mock function
   */
  fetchFn: (signal?: AbortSignal) => Promise<T>;
  /**
   * Initial data value
   */
  initialData?: T;
  /**
   * Whether to fetch immediately on mount
   * @default true
   */
  immediate?: boolean;
  /**
   * Delay in milliseconds before fetching (useful for mock data simulation)
   * @default 0
   */
  delay?: number;
}

export interface UseFetchResult<T> {
  /**
   * The fetched data
   */
  data: T;
  /**
   * Whether the request is currently loading
   */
  loading: boolean;
  /**
   * Error object if the request failed
   */
  error: Error | null;
  /**
   * Function to manually refetch the data
   */
  refetch: () => void;
}

/**
 * Generic hook for fetching data
 *
 * @example
 * ```tsx
 * const { data, loading, error } = useFetch({
 *   fetchFn: async (signal) => {
 *     const response = await fetch('/api/data', { signal });
 *     return response.json();
 *   },
 *   initialData: [],
 * });
 * ```
 */
export function useFetch<T>({
  fetchFn,
  initialData,
  immediate = true,
  delay = 0,
}: UseFetchOptions<T>): UseFetchResult<T> {
  const [data, setData] = useState<T>(initialData as T);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = async () => {
    // Abort previous request if it exists
    abortControllerRef.current?.abort();

    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    try {
      // Apply delay if specified
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      // Check if request was aborted during delay
      if (abortController.signal.aborted) return;

      const result = await fetchFn(abortController.signal);

      // Only update state if request wasn't aborted
      if (!abortController.signal.aborted) {
        setData(result);
        setLoading(false);
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (!abortController.signal.aborted) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!immediate) return;

    fetchData();

    // Cleanup: abort request on unmount
    return () => {
      abortControllerRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
