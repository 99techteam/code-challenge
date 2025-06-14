import { useMemo, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getTokenIcon } from '@/utils/getTokenIcon';
import { CheckIcon, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { cn } from '@/lib/utils';

type TokenComboboxProps = {
  value: string;
  onChange: (val: string) => void;
  tokens: string[];
  bgColor?: string;
};

export default function TokenCombobox({
  value,
  onChange,
  tokens,
  bgColor = 'bg-background',
}: TokenComboboxProps) {
  const [open, setOpen] = useState(false);

  const selectedToken = useMemo(() => value, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className='w-[220px]'>
        <Button
          variant='noShadow'
          role='combobox'
          aria-expanded={open}
          className={`justify-between px-2 h-10 ${bgColor} cursor-pointer hover:opacity-70 transition-all`}
        >
          {selectedToken ? (
            <div className='flex items-center gap-2'>
              <Avatar className='size-5'>
                <AvatarImage src={getTokenIcon(selectedToken)} />
                <AvatarFallback>{selectedToken[0]}</AvatarFallback>
              </Avatar>
              {selectedToken}
            </div>
          ) : (
            'Select token...'
          )}
          <ChevronsUpDown className='text-muted-foreground' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[220px] border-0 p-0'>
        <Command
          className={`**:data-[slot=command-input-wrapper]:h-11 ${bgColor} rounded-md`}
        >
          <CommandInput placeholder='Search token...' />
          <CommandList className='p-1'>
            <CommandEmpty>No token found.</CommandEmpty>
            <CommandGroup className='[&_[cmdk-group-items]]:flex [&_[cmdk-group-items]]:flex-col [&_[cmdk-group-items]]:gap-1'>
              {tokens.map((token) => (
                <CommandItem
                  key={token}
                  value={token}
                  onSelect={(currentValue) => {
                    onChange(currentValue);
                    setOpen(false);
                  }}
                  className='cursor-pointer'
                >
                  <Avatar className='size-5'>
                    <AvatarImage src={getTokenIcon(token)} />
                    <AvatarFallback>{token[0]}</AvatarFallback>
                  </Avatar>
                  {token}
                  <CheckIcon
                    className={cn(
                      'ml-auto',
                      value === token ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
