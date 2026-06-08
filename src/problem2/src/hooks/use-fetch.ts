import { useEffect, useState } from 'react';
import httpClient from '@/services/http-client';

export const useFetch = <T>(url: string) => {
  const [data, setData] = useState<T | null | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const json = await httpClient.get<T>(url);
        setData(json);
      } catch (error) {
        setError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};
