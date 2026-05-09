import { useState } from "react";
export type FetchMethods = "GET" | "POST" | "PUT" | "DELETE";

export type FetchOptions = {
  method: FetchMethods;
  headers: Record<string, string>;
  body: string;
};

export function useFetch<Type>(): {
  data: Type | null;
  loading: boolean;
  error: Error | null;
  invoke: (url: string, options?: FetchOptions) => void;
} {
  const [data, setData] = useState<Type | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const invoke = (url: string, options?: FetchOptions) => {
    setLoading(true);
    setError(null);
    fetch(url, options)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        return response.json();
      })
      .then((data) => setData(data))
      .catch((error) => setError(error))
      .finally(() => setLoading(false));
  };

  return { data, loading, error, invoke };
}
