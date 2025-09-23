import { WalletPage } from './components/WalletPage'
import { ErrorBoundary } from './components/ErrorBoundary'
import './App.css'

function App() {
  return (
    <div className="App">
      <ErrorBoundary>
        <WalletPage />
      </ErrorBoundary>
    </div>
  )
}

export default App
