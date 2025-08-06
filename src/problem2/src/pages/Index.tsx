import { SwapCard } from '@/components/SwapCard';
import { ThemeSelector } from '@/components/ThemeSelector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTokenPrices } from '@/hooks/useTokenPrices';
import { AlertTriangle, Loader2 } from 'lucide-react';

const Index = () => {
  const { tokens, loading, error } = useTokenPrices();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="glass-card max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load token data: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      {/* Theme Selector - Fixed Position */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeSelector />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="glass-card p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading token data...</p>
        </div>
      ) : (
        <SwapCard tokens={tokens} />
      )}

    </div>
  );
};

export default Index;
