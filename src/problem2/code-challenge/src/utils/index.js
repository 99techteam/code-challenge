function getSwapRate(fromCurrency, toCurrency, swapRates) {
    if (typeof fromCurrency !== 'string' || typeof toCurrency !== 'string' || !Array.isArray(swapRates)) {
        return 'N/A';
    }

    const fromSymbol = fromCurrency.toLowerCase();
    const toSymbol = toCurrency.toLowerCase();
    const fromRate = swapRates.find(
        rate => rate.currency.toLowerCase() === fromSymbol,
    )?.price;
    const toRate = swapRates.find(
        rate => rate.currency.toLowerCase() === toSymbol,
    )?.price;
    if(Number.isFinite(fromRate) && Number.isFinite(toRate)) {
        return fromRate / toRate;
    }else {
        return "N/A";
    }
}

export default getSwapRate