import CurrencySwapForm from './components/CurrencySwapForm'
import Navbar from './components/Navbar'

function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-200">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8 flex flex-col lg:flex-row items-center gap-8">
        <div className="flex-1 text-center lg:text-left space-y-4">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Swap tokens instantly.
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto lg:mx-0">
            Fast, secure, and reliable currency swaps at the best market rates.
          </p>
        </div>
        <div className="flex-none w-full max-w-md relative">
          <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-20 dark:opacity-40 rounded-full"></div>
          <div className="relative rounded-3xl">
            <CurrencySwapForm />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
