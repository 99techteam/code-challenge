import CurrencyConverter from './components/CurrencyConverter'

function App() {
  return (
    <div 
      className="w-full min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <CurrencyConverter />
    </div>
  )
}

export default App 