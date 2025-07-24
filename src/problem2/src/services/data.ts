import api from './axios-instance'
import type { RawPrices } from '@/types'
import { generateRandomBalanceMap } from '@/fake-data'
import { transformPrices } from '@/utils'

export const getPrices = async () => {
  const { data } = await api.get<RawPrices>('/prices.json')
  return transformPrices(data)
}

export const getBalances = async () => {
  return generateRandomBalanceMap()
}
