import { useState, useEffect } from "react";

interface UseDataResult<T> {
	data: T | null;
	isLoading: boolean;
	error: string | null;
}

// Hook to fetch data from a given API endpoint
export function useData<T = unknown>(
	endpoint: string | undefined,
	options?: RequestInit
): UseDataResult<T> {
	const [data, setData] = useState<T | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!endpoint) {
			setError("API endpoint is not set.");
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		fetch(endpoint, options)
			.then((response) => {
				if (!response.ok) throw new Error(response.statusText);
				return response.json();
			})
			.then((data: T) => {
				setData(data);
				setError(null);
			})
			.catch((err) => {
				setError("Fetch error: " + err.message);
				setData(null);
			})
			.finally(() => {
				setTimeout(() => setIsLoading(false), 1000); // Optional: simulate delay
			});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [endpoint]);

	return { data, isLoading, error };
}
