import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import type { ClassValue } from 'clsx'

export const cn = (...inputs: ClassValue[]): string => {
  return twMerge(clsx(inputs))
}
