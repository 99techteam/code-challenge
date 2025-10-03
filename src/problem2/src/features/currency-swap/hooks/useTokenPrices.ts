import { useEffect, useState } from 'react';
import { fetchTokenPrices } from '../services/tokenService';
import type { Token } from '../types';

interface UseTokenPricesReturn {
    tokens: Token[];
    loading: boolean;
    error: Error | null;
}

export function useTokenPrices(): UseTokenPricesReturn {
    const [tokens, setTokens] = useState<Token[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const tokenData = await fetchTokenPrices();
            setTokens(tokenData);
        } catch (err) {
            const error =
                err instanceof Error
                    ? err
                    : new Error('Failed to fetch token prices');
            setError(error);
            console.error('Error fetching token prices:', error);

            // Fallback to empty array or default tokens if needed
            setTokens([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return { tokens, loading, error };
}
