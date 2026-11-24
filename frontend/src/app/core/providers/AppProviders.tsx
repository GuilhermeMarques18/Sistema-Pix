'use client';

import { ReactNode } from 'react';
import { SessionProvider } from '@/app/core/auth/SessionProvider';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Agrupa todos os providers globais da aplicação.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
