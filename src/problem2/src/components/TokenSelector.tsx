import { useState, useDeferredValue } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import type { EnrichedToken } from '@/types/swap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface TokenSelectorProps {
  selectedToken: EnrichedToken | null;
  tokens: EnrichedToken[];
  onSelectToken: (token: EnrichedToken) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const TokenSelector = ({
  selectedToken,
  tokens,
  onSelectToken,
  disabled = false,
  placeholder = "Select token"
}: TokenSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const deferredSearchTerm = useDeferredValue(searchTerm);
  
  const filteredTokens = deferredSearchTerm
    ? tokens.filter(token =>
        token.currency.toLowerCase().includes(deferredSearchTerm.toLowerCase())
      )
    : tokens;

  const handleSelectToken = (token: EnrichedToken) => {
    onSelectToken(token);
    setOpen(false);
    setSearchTerm('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="glass-card w-full h-14 justify-between p-4 text-left font-medium"
        >
          {selectedToken ? (
            <div className="flex items-center gap-3">
              <div className="relative w-6 h-6">
                <img
                  src={selectedToken.iconUrl}
                  alt={selectedToken.currency}
                  className="w-6 h-6 token-icon"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 bg-secondary rounded-full flex items-center justify-center text-xs font-semibold">
                  {selectedToken.currency.slice(0, 2)}
                </div>
              </div>
              <div>
                <div className="font-semibold">{selectedToken.currency}</div>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="glass-card max-w-md">
        <DialogHeader>
          <DialogTitle>Select a token</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tokens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-glass pl-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto space-y-1">
            {filteredTokens.length > 0 ? (
              filteredTokens.map((token) => (
                <Button
                  key={token.currency}
                  variant="ghost"
                  className="w-full justify-start h-auto p-4 hover:bg-secondary hover:text-secondary-foreground"
                  onClick={() => handleSelectToken(token)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="relative w-8 h-8">
                      <img
                        src={token.iconUrl}
                        alt={token.currency}
                        className="w-8 h-8 token-icon"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling;
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden absolute inset-0 bg-secondary rounded-full flex items-center justify-center text-sm font-semibold">
                        {token.currency.slice(0, 2)}
                      </div>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{token.currency}</div>
                    </div>
                    {token.price && (
                      <div className="text-sm font-medium">
                        ${token.price.toFixed(6)}
                      </div>
                    )}
                  </div>
                </Button>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No tokens found matching "{searchTerm}"
              </div>
            )}
          </div>
          
          {filteredTokens.length > 0 && (
            <div className="text-center py-2 text-xs text-muted-foreground">
              {filteredTokens.length} tokens available
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};