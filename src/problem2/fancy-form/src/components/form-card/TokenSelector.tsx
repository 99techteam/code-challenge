import { getTokenIcon } from '@/common/constants/token-mapping';
import type { Token } from '@/common/types/token';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';
import { useTokenStore } from '@/store/token.store';
import { useMemo, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';

interface Props {
  selectedToken: Token | undefined;
  onSelect: (value: Token) => void;
}

export function TokenSelector({ selectedToken, onSelect }: Props) {
  const [search, setSearch] = useState('');
  const searchDebounced = useDebounce(search, 500);
  const [open, setOpen] = useState(false);
  const { tokens } = useTokenStore();

  const tokenIcon = getTokenIcon(selectedToken?.currency || 'ETH');

  const filteredTokens = useMemo(
    () =>
      tokens?.filter((token) =>
        token.currency.toLowerCase().includes(searchDebounced.toLowerCase())
      ),
    [tokens, searchDebounced]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center ml-2 gap-2 bg-surface-container-highest hover:bg-surface-bright transition-all rounded-xl px-3 py-2 border border-white/10 shrink-0 cursor-pointer active:scale-95 group">
          {tokenIcon ? (
            <img
              className="w-6 h-6 rounded-full overflow-hidden"
              src={tokenIcon}
              alt={selectedToken?.currency}
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-surface-container-low" />
          )}
          <p>{selectedToken?.currency}</p>
        </button>
      </DialogTrigger>
      <DialogContent className="glass-card-lg border-white/10 text-on-surface max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-headline-md mb-4">
            Select a Token
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <Input
              placeholder="Search name or paste address"
              className="bg-surface-container-low border-white/10 pl-10 h-12 rounded-xl focus:ring-primary/30"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-[350px] overflow-y-auto pr-2 scrollbar-glass space-y-1">
            {filteredTokens?.map((token, index) => (
              <button
                key={`${token.currency}-${index}`}
                onClick={() => {
                  onSelect(token);
                  setOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer',
                  selectedToken?.currency === token.currency && 'bg-white/5'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 p-2">
                    <img
                      src={token.symbol}
                      alt={token.currency}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-display font-bold text-on-surface">
                      {token.currency}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-1">
                  <p className="font-display font-medium text-sm">
                    {token.price}
                  </p>
                  <img src={getTokenIcon('USD')} alt={token.currency} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
