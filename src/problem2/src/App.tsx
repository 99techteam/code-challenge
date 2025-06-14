import CurrencySwap from '@/components/CurrencySwap';
import Credit from '@/components/Credit';

export default function App() {
  return (
    <div className='min-h-screen bg-grid-paper flex flex-col items-center justify-center p-4'>
      <CurrencySwap />
      <Credit />
    </div>
  );
}
