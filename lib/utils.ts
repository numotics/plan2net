import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const hashCode = (str: string) => Array.from(str).reduce((s, c) => Math.imul(16777619, s) + c.charCodeAt(0) | 0, 0)
export const intToHexColor = (num: number) => `#${(num & 0xFFFFFF).toString(16).padStart(6, '0')}`;
