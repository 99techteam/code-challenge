import { useContext } from 'react'
import { ActionContext, StateContext } from '@/context/balances'

const useBalancesState = () => {
  const value = useContext(StateContext)
  if (typeof value === 'undefined') {
    throw new Error('useBalancesState must be used within a ContextProvider')
  }

  return value
}

const useBalancesAction = () => {
  const value = useContext(ActionContext)
  if (typeof value === 'undefined') {
    throw new Error('useBalancesAction must be used within a ContextProvider')
  }

  return value
}

export { useBalancesState, useBalancesAction }
