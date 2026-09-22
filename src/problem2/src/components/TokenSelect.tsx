import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';

import { TokenIcon } from '@/components/TokenIcon';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { searchTokens } from '@/lib/tokens';
import { cn } from '@/lib/utils';
import type { SwapSide, Token } from '@/types';

interface TokenSelectProps {
  side: SwapSide;
  /** The asset currently on this side, or `null` before prices load. */
  value: Token | null;
  tokens: Token[];
  onSelect: (code: string) => void;
}

const SIDE_LABEL: Record<SwapSide, string> = {
  from: 'Convert from',
  to: 'Convert to',
};

/**
 * How long the field sits still before the list re-filters. Long enough that a
 * typed word costs one pass instead of one per letter, short enough to read as
 * instant — the results land before a hand leaves the keyboard.
 */
const SEARCH_DEBOUNCE_MS = 150;

/**
 * The asset picker: a pill that opens a searchable list of everything the price
 * feed quotes. Search matches ticker and name, so "usd" finds USDC, BUSD and
 * Carbon USD alike.
 *
 * The field is controlled and the list is filtered here rather than by cmdk, so
 * that the two can move at different speeds: the text updates on every keystroke
 * and the list follows once typing pauses.
 */
export function TokenSelect({ side, value, tokens, onSelect }: TokenSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, SEARCH_DEBOUNCE_MS);

  // Clearing the field skips the wait: the full list is already in memory, so
  // there is nothing to spare the user by holding it back.
  const query = search === '' ? '' : debouncedSearch;
  const matches = useMemo(() => searchTokens(tokens, query), [tokens, query]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    // A menu reopened later opens on the whole list, not on the last search.
    if (!next) setSearch('');
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        disabled={!value}
        aria-label={value ? `${SIDE_LABEL[side]} — ${value.code}` : SIDE_LABEL[side]}
        className={cn(
          'inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-card pr-2.5 pl-1.5 text-sm font-medium text-foreground shadow-ring-card outline-none',
          'transition-all active:translate-y-px hover:shadow-[0_0_0_1px_var(--color-neutral-400),var(--shadow-xs)]',
          'focus-visible:ring-[3px] focus-visible:ring-ring/50',
          'disabled:pointer-events-none disabled:opacity-50',
        )}
      >
        {value ? (
          <>
            <TokenIcon code={value.code} src={value.iconUrl} />
            <span className="font-mono tracking-[0.01em]">{value.code}</span>
          </>
        ) : (
          <span className="pl-2 font-mono text-muted-foreground">—</span>
        )}
        <ChevronDownIcon
          className="size-3.75 text-muted-foreground transition-transform duration-200 ease-standard"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </PopoverTrigger>

      <PopoverContent align="end" sideOffset={10} className="w-[min(304px,78vw)] p-1.5">
        {/*
          `shouldFilter={false}` hands the matching to `searchTokens`. cmdk would
          otherwise re-score and re-order all 32 rows in the DOM on every
          keystroke — the work the debounce exists to avoid.
        */}
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search asset or ticker"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[232px]">
            <CommandEmpty>No asset matches that search.</CommandEmpty>
            <CommandGroup className="p-0">
              {matches.map((token) => {
                const selected = token.code === value?.code;

                return (
                  <CommandItem
                    key={token.code}
                    value={`${token.code} ${token.name}`}
                    onSelect={() => {
                      onSelect(token.code);
                      setOpen(false);
                    }}
                    className={cn(selected && 'bg-primary/20 data-[selected=true]:bg-primary/25')}
                  >
                    <TokenIcon code={token.code} src={token.iconUrl} className="size-7 text-xs" />
                    <span className="flex min-w-0 flex-1 flex-col gap-px">
                      <span className="font-mono text-sm leading-tight font-medium">
                        {token.code}
                      </span>
                      <span className="truncate text-xs leading-tight text-muted-foreground">
                        {token.name}
                      </span>
                    </span>
                    <CheckIcon className={cn('size-3.75', !selected && 'opacity-0')} />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
