import { Outlet } from 'react-router'
import { PricesProvider } from '@/context/prices'
import { BalancesProvider } from '@/context/balances'
import { SwapProvider } from '@/context/swap'

const Layout = () => {
  return (
    <PricesProvider>
      <BalancesProvider>
        <SwapProvider>
          <Outlet />
        </SwapProvider>
      </BalancesProvider>
    </PricesProvider>
  )
}

export default Layout
