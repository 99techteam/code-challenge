import { cn } from '@/lib/utils';
import * as React from 'react';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'bg-transparent border-none outline-none font-display w-full  placeholder:text-outline-variant p-0 focus:ring-0 selection:bg-primary/30',
        className
      )}
      {...props}
    />
  );
}

export { Input };
