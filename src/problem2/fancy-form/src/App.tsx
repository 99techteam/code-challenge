import { SwapCard } from './components/form-card/FormCard';
import { TooltipProvider } from './components/ui/tooltip';

function App() {
  return (
    <TooltipProvider>
      <main className="relative z-10 flex flex-col items-center justify-center pt-32 pb-24">
        <SwapCard />
      </main>
    </TooltipProvider>
  );
}

export default App;
