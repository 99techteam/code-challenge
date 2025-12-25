import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFetch } from './useFetch';

describe('useFetch', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Successful fetch', () => {
    it('should fetch data successfully with immediate = true', async () => {
      const mockData = { id: 1, name: 'Test' };
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useFetch({
          fetchFn,
          initialData: null,
          immediate: true,
        })
      );

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);

      // Wait for fetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBe(null);
      expect(fetchFn).toHaveBeenCalledTimes(1);
    });

    it('should not fetch immediately when immediate = false', () => {
      const fetchFn = vi.fn().mockResolvedValue({ data: 'test' });

      const { result } = renderHook(() =>
        useFetch({
          fetchFn,
          initialData: null,
          immediate: false,
        })
      );

      expect(result.current.loading).toBe(false);
      expect(fetchFn).not.toHaveBeenCalled();
    });

    it('should use initial data', () => {
      const initialData = { id: 0, name: 'Initial' };
      const fetchFn = vi.fn().mockResolvedValue({ id: 1, name: 'Fetched' });

      const { result } = renderHook(() =>
        useFetch({
          fetchFn,
          initialData,
          immediate: false,
        })
      );

      expect(result.current.data).toEqual(initialData);
    });

    it('should handle array data', async () => {
      const mockData = [1, 2, 3, 4, 5];
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useFetch({
          fetchFn,
          initialData: [] as number[],
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it('should handle string data', async () => {
      const mockData = 'Hello, World!';
      const fetchFn = vi.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() =>
        useFetch({
          fetchFn,
          initialData: '',
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBe(mockData);
    });
  });

  describe('Error handling', () => {
    it('should handle fetch errors', async () => {
      const errorMessage = 'Network error';
      const fetchFn = vi.fn().mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() =>
        useFetch({
          fetchFn,
          initialData: null,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe(errorMessage);
      expect(result.current.data).toBe(null);
    });

    it('should wrap non-Error objects in Error', async () => {
      const fetchFn = vi.fn().mockRejectedValue('String error');

      const { result } = renderHook(() =>
        useFetch({
          fetchFn,
          initialData: null,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe('Unknown error');
    });

    it('should clear previous error on successful refetch', async () => {
      let shouldFail = true;
      const fetchFn = vi.fn().mockImplementation(() => {
        if (shouldFail) {
          return Promise.reject(new Error('Failed'));
        }
        return Promise.resolve({ success: true });
      });

      const { result } = renderHook(() =>
        useFetch({
          fetchFn,
          initialData: null,
        })
      );

      // Wait for initial error
      await waitFor(() => {
        expect(result.current.error).not.toBe(null);
      });

      expect(result.current.error).toBeInstanceOf(Error);

      // Now make it succeed
      shouldFail = false;
      result.current.refetch();

      // Wait for the data to update (which means refetch completed successfully)
      await waitFor(() => {
        expect(result.current.data).toEqual({ success: true });
      });

      expect(result.current.error).toBe(null);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('Refetch functionality', () => {
    it('should refetch data when refetch is called', async () => {
      let callCount = 0;
      const fetchFn = vi.fn().mockImplementation(() => {
        callCount++;
        return Promise.resolve({ count: callCount });
      });

      const { result } = renderHook(() =>
        useFetch({
          fetchFn,
          initialData: { count: 0 },
        })
      );

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.data.count).toBe(1);
      });

      // Call refetch
      result.current.refetch();

      await waitFor(() => {
        expect(result.current.data.count).toBe(2);
      });

      expect(fetchFn).toHaveBeenCalledTimes(2);
    });

    it('should set loading state during refetch', async () => {
      // Use a promise that takes a bit longer to resolve so we can observe the loading state
      const fetchFn = vi
        .fn()
        .mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ data: 'test' }), 50)
            )
        );

      const { result } = renderHook(() =>
        useFetch({
          fetchFn,
          initialData: null,
          immediate: false,
        })
      );

      expect(result.current.loading).toBe(false);

      result.current.refetch();

      // Loading state should be set to true during the refetch
      await waitFor(() => {
        expect(result.current.loading).toBe(true);
      });

      // Then it should go back to false when done
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Delay functionality', () => {
    it('should delay fetch by specified milliseconds', async () => {
      const mockData = { delayed: true };
      const fetchFn = vi.fn().mockResolvedValue(mockData);
      const delayTime = 100; // Use a short real delay

      const startTime = Date.now();

      const { result } = renderHook(() =>
        useFetch({
          fetchFn,
          initialData: null,
          delay: delayTime,
        })
      );

      expect(result.current.loading).toBe(true);
      expect(fetchFn).not.toHaveBeenCalled();

      // Wait for the delay to complete and data to be loaded
      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 1000 }
      );

      const endTime = Date.now();
      const actualDelay = endTime - startTime;

      // Verify the delay was approximately correct (within 50ms tolerance)
      expect(actualDelay).toBeGreaterThanOrEqual(delayTime - 10);
      expect(fetchFn).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(mockData);
    });

    it('should not fetch if aborted during delay', async () => {
      vi.useFakeTimers();

      const fetchFn = vi.fn().mockResolvedValue({ data: 'test' });

      const { result, unmount } = renderHook(() =>
        useFetch({
          fetchFn,
          initialData: null,
          delay: 1000,
        })
      );

      expect(result.current.loading).toBe(true);

      // Unmount before delay completes
      await vi.advanceTimersByTimeAsync(500);
      unmount();

      await vi.advanceTimersByTimeAsync(500);

      // fetchFn should not be called because component unmounted
      expect(fetchFn).not.toHaveBeenCalled();

      vi.useRealTimers();
    });
  });

  describe('Abort signal', () => {
    it('should pass abort signal to fetch function', async () => {
      const fetchFn = vi.fn().mockResolvedValue({ data: 'test' });

      renderHook(() =>
        useFetch({
          fetchFn,
          initialData: null,
        })
      );

      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(1);
      });

      // Check that abort signal was passed
      const callArgs = fetchFn.mock.calls[0];
      expect(callArgs[0]).toBeInstanceOf(AbortSignal);
    });

    it('should abort previous request when refetching', async () => {
      let abortedSignal: AbortSignal | undefined;
      const fetchFn = vi.fn().mockImplementation((signal?: AbortSignal) => {
        abortedSignal = signal;
        return new Promise((resolve) => {
          setTimeout(() => resolve({ data: 'test' }), 100);
        });
      });

      const { result } = renderHook(() =>
        useFetch({
          fetchFn,
          initialData: null,
        })
      );

      // First fetch starts
      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(1);
      });

      const firstSignal = abortedSignal;

      // Trigger refetch before first completes
      result.current.refetch();

      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(2);
      });

      // First signal should be aborted
      expect(firstSignal?.aborted).toBe(true);
    });

    it('should abort request on unmount', async () => {
      let abortedSignal: AbortSignal | undefined;
      const fetchFn = vi.fn().mockImplementation((signal?: AbortSignal) => {
        abortedSignal = signal;
        return new Promise((resolve) => {
          setTimeout(() => resolve({ data: 'test' }), 100);
        });
      });

      const { unmount } = renderHook(() =>
        useFetch({
          fetchFn,
          initialData: null,
        })
      );

      await waitFor(() => {
        expect(fetchFn).toHaveBeenCalledTimes(1);
      });

      unmount();

      expect(abortedSignal?.aborted).toBe(true);
    });

    it('should not update state if request is aborted', async () => {
      const fetchFn = vi.fn().mockImplementation((signal?: AbortSignal) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            if (!signal?.aborted) {
              resolve({ data: 'test' });
            }
          }, 100);
        });
      });

      const { result, unmount } = renderHook(() =>
        useFetch({
          fetchFn,
          initialData: null,
        })
      );

      expect(result.current.loading).toBe(true);

      // Unmount before fetch completes
      unmount();

      // Wait a bit to ensure promise would have resolved
      await new Promise((resolve) => setTimeout(resolve, 150));

      // State should remain in loading because component is unmounted
      // and should not update
      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBe(null);
    });
  });

  describe('TypeScript type safety', () => {
    it('should infer correct types from initial data', async () => {
      interface User {
        id: number;
        name: string;
      }

      const mockUser: User = { id: 1, name: 'John' };
      const fetchFn = vi.fn().mockResolvedValue(mockUser);

      const { result } = renderHook(() =>
        useFetch({
          fetchFn,
          initialData: null as User | null,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // TypeScript should know data is User | null
      if (result.current.data) {
        expect(result.current.data.id).toBe(1);
        expect(result.current.data.name).toBe('John');
      }
    });

    it('should work with array types', async () => {
      const mockArray = [1, 2, 3];
      const fetchFn = vi.fn().mockResolvedValue(mockArray);

      const { result } = renderHook(() =>
        useFetch({
          fetchFn,
          initialData: [] as number[],
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(Array.isArray(result.current.data)).toBe(true);
      expect(result.current.data).toHaveLength(3);
    });
  });

  describe('Edge cases', () => {
    it('should handle fetch returning null', async () => {
      const fetchFn = vi.fn().mockResolvedValue(null);

      const { result } = renderHook(() =>
        useFetch({
          fetchFn,
          initialData: { data: 'initial' },
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);
    });

    it('should handle fetch returning undefined', async () => {
      const fetchFn = vi.fn().mockResolvedValue(undefined);

      const { result } = renderHook(() =>
        useFetch({
          fetchFn,
          initialData: { data: 'initial' },
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toBe(undefined);
      expect(result.current.error).toBe(null);
    });

    it('should handle rapid consecutive refetches', async () => {
      let count = 0;
      const fetchFn = vi.fn().mockImplementation(() => {
        count++;
        return Promise.resolve({ count });
      });

      const { result } = renderHook(() =>
        useFetch({
          fetchFn,
          initialData: { count: 0 },
        })
      );

      await waitFor(() => {
        expect(result.current.data.count).toBe(1);
      });

      // Rapid refetches
      result.current.refetch();
      result.current.refetch();
      result.current.refetch();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should complete all refetches, but previous ones will be aborted
      expect(fetchFn.mock.calls.length).toBeGreaterThan(1);
    });

    it('should handle empty object as data', async () => {
      const fetchFn = vi.fn().mockResolvedValue({});

      const { result } = renderHook(() =>
        useFetch({
          fetchFn,
          initialData: null,
        })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual({});
      expect(result.current.error).toBe(null);
    });
  });
});
