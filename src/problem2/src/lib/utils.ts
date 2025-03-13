import { clsx, type ClassValue } from 'clsx';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const withLoading =
  (setLoading: React.Dispatch<React.SetStateAction<boolean>>) =>
  <T>(promise: Promise<T>): Promise<T> => {
    setLoading(true);
    return promise.finally(() => {
      setLoading(false);
    });
  };
