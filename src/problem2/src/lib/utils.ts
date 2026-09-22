import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn/ui's class helper: conditional classes in, de-duplicated Tailwind out. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
