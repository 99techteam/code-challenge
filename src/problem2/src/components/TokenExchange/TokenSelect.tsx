import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IToken } from '@/types';

interface Props {
  data: IToken[]
  value: string,
  onSelect: (value: string) => void
}

export function TokenSelect({
  data,
  value,
  onSelect,
}: Props) {
  function handleSelect(value: string) {
    onSelect(value);
  }

  return (
    <Select value={value} onValueChange={handleSelect} required>
      <SelectTrigger className='w-full'>
        <SelectValue placeholder="Select Token" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {data.map((token) => (
            <SelectItem key={token.currency} value={token.currency}>
              <div className='flex gap-2 items-center py-1'>
                <img src={token.imageUrl} alt={`${token.currency} logo`} className='w-6 h-6' />
                {token.currency}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
