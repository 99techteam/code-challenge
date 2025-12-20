export interface ExchangeRate {
	price: number;
	date: string;
}

export interface ExchangeRates {
	[currency: string]: ExchangeRate;
}

export interface TokenPriceItem {
	currency: string;
	date: string;
	price: number;
}
