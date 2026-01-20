import axios from 'axios'
import { TokenPrice } from 'src/types/token.type'

const PRICES_API_URL = 'https://interview.switcheo.com/prices.json'
const TOKEN_ICONS_BASE_URL = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens'

export const tokenApi = {
  getTokenPrices: async (): Promise<TokenPrice[]> => {
    const response = await axios.get<TokenPrice[]>(PRICES_API_URL)
    return response.data
  },

  getTokenIconUrl: (currency: string): string => {
    return `${TOKEN_ICONS_BASE_URL}/${currency}.svg`
  }
}

export default tokenApi
