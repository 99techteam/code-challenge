import SwapCard from '../components/SwapCard';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Swap</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Exchange your tokens instantly ✨
          </p>
        </div>
        <SwapCard />
      </div>
    </main>
  );
}
