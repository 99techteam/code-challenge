import { useState, useEffect, useMemo } from 'react';
import type { ExchangeRates, TokenPriceItem } from '../types/token';

const API_URL = 'https://interview.switcheo.com/prices.json';

export const useTokenPrices = () => {
	const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string>('');

	useEffect(() => {
		const fetchPrices = async () => {
			try {
				setLoading(true);
				const response = await fetch(API_URL);
				const data: TokenPriceItem[] = await response.json();

				const latestRates = data.reduce((acc: ExchangeRates, item) => {
					const { currency, date, price } = item;
					const existing = acc[currency];

					if (!existing || new Date(existing.date) < new Date(date)) {
						acc[currency] = { price, date };
					}
					return acc;
				}, {});

				setExchangeRates(latestRates);
			} catch {
				setError('Failed to fetch exchange rates.');
			} finally {
				setLoading(false);
			}
		};

		fetchPrices();
	}, []);

	const currencies = useMemo(() => Object.keys(exchangeRates), [exchangeRates]);

	return { exchangeRates, currencies, loading, error };
};
