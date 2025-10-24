export interface CurrencyPrice {
    currency: string
    date: string
    price?: string
}

export const fetchCurrencyPriceList = async (): Promise<CurrencyPrice[]> => {
    try {
        const currencyPriceListResponse = await fetch('https://interview.switcheo.com/prices.json', {
            method: 'GET'
        })
        return await currencyPriceListResponse.json() as unknown as CurrencyPrice[]
    } catch (error) {
        console.log('fetchTokenPriceList failed to fetch token price data');
        return []
    }
}