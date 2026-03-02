import { Toaster } from 'sonner'
import { SwapCard } from './components/SwapCard'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-100 flex items-center justify-center p-4">
      <SwapCard />
      <Toaster position="top-center" richColors />
    </div>
  )
}

export default App
