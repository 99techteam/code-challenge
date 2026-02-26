import { WalletPage } from './WalletPage'
import { MOCK_BALANCES, MOCK_PRICES } from './mockData'
function App() {

  return (
    <>
      <WalletPage balances={MOCK_BALANCES} prices={MOCK_PRICES} />
    </>
  )
}

export default App
