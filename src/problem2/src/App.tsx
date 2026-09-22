import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { SwapCard } from '@/components/SwapCard';
import { createQueryClient } from '@/queryClient';

export function App() {
  // One client for the life of the app. The lazy initialiser is what keeps it
  // to one: a client built in the render body would be thrown away and rebuilt,
  // cache and all, on every render.
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <main className="flex min-h-dvh items-center justify-center bg-background px-5 py-12">
        <SwapCard />
      </main>
    </QueryClientProvider>
  );
}
