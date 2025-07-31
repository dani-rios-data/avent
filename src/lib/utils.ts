import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number): string {
  if (value >= 1000000000) {
    const formatted = (value / 1000000000).toFixed(1);
    return formatted.endsWith('.0') ? formatted.slice(0, -2) + 'B' : formatted + 'B';
  } else if (value >= 1000000) {
    const formatted = (value / 1000000).toFixed(1);
    return formatted.endsWith('.0') ? formatted.slice(0, -2) + 'M' : formatted + 'M';
  } else if (value >= 1000) {
    const formatted = (value / 1000).toFixed(1);
    return formatted.endsWith('.0') ? formatted.slice(0, -2) + 'K' : formatted + 'K';
  } else {
    return value.toLocaleString('en-US');
  }
}
