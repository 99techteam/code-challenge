import { useContext } from 'react'
import { ActionContext, StateContext } from '@/context/prices'

const usePricesState = () => {
  const value = useContext(StateContext)
  if (typeof value === 'undefined') {
    throw new Error('usePricesState must be used within a ContextProvider')
  }

  return value
}

const usePricesAction = () => {
  const value = useContext(ActionContext)
  if (typeof value === 'undefined') {
    throw new Error('usePricesAction must be used within a ContextProvider')
  }

  return value
}

export { usePricesState, usePricesAction }
