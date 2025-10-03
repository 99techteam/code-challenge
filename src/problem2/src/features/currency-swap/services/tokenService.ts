import axios from 'axios';

interface RawPriceResponse {
    [symbol: string]: {
        currency: string;
        logo: string;
        price: number;
        date: string;
    };
}
export async function fetchTokenPrices() {
    const { data } = await axios.get<RawPriceResponse>(
        'https://interview.switcheo.com/prices.json'
    );
    return (
        Object.entries(data)
            // .filter(([_, price]) => price > 0)
            .map(([symbol, token]) => ({
                id: symbol, // stable id
                currency: token.currency,
                logo: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${token.currency}.svg`,
                price: token.price,
                date: token.date,
            }))
    );
}
