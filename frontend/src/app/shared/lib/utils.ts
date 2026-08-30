import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina classes Tailwind evitando conflitos.
 * Utilizado pelos componentes shadcn/ui e por toda a aplicação.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
