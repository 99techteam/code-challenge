export const usePrices = (): Record<string, number> => {
    // fake mockup of Prices data. in reality we fetch from an API
    return {
        "ETH": 123,
        "BTC": 110000,
        "Pi": 0.2
    }
}