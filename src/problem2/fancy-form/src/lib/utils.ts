import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const debounce = (fn: () => void, delay: number) => {
  let timeout: number;
  return () => {
    clearTimeout(timeout);

    timeout = setTimeout(fn, delay);
  };
};
