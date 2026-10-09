import axiosClient from '../axios.js'
import URL from '../../constants/index.js'


async function getSwapRates({ signal } = {}) {

  const rates = await axiosClient.get(URL.SWAP_RATES, { signal })
  const seenCurrencies = new Set()

  return rates.filter((rate) => {
    const currencyName = rate.currency.toLowerCase()
    if (seenCurrencies.has(currencyName)) {
      return false
    }

    seenCurrencies.add(currencyName)
    return true
  })
}

export default getSwapRates