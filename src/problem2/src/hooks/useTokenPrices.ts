import { useState, useEffect } from 'react';
import type { ExchangeRates, TokenPriceItem } from '../types/token';

const API_URL = 'https://interview.switcheo.com/prices.json';

export const useTokenPrices = () => {
	const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string>('');

	useEffect(() => {
		const fetchExchangeRates = async () => {
			try {
				setLoading(true);
				setError('');
				const response = await fetch(API_URL);
				const data: TokenPriceItem[] = await response.json();
				
				const latestRates = data.reduce(
					(acc: ExchangeRates, item: TokenPriceItem) => {
						const { currency: curr, date, price } = item;
						const currentDate = new Date(date);
						if (!acc[curr] || new Date(acc[curr].date) < currentDate) {
							acc[curr] = { price, date };
						}
						return acc;
					},
					{}
				);
				setExchangeRates(latestRates);
			} catch (err) {
				console.error('Error fetching exchange rates:', err);
				setError('Failed to fetch exchange rates.');
			} finally {
				setLoading(false);
			}
		};

		fetchExchangeRates();
	}, []);

	const currencies = Object.keys(exchangeRates).filter(
		(curr) => exchangeRates[curr]?.price
	);

	return { exchangeRates, currencies, loading, error };
};
