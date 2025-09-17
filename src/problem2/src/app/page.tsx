import SwapForm from '@/components/SwapForm';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <header className="text-center py-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Currency Swap
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Trade your favorite cryptocurrencies instantly with the best rates and lowest fees.
          </p>
        </header>

        {/* Main Content */}
        <main className="flex justify-center items-start">
          <SwapForm />
        </main>

        {/* Footer */}
        <footer className="text-center py-8 mt-12 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Built with Next.js and Tailwind CSS
          </p>
        </footer>
      </div>
    </div>
  );
}
