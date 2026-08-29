'use client';

import { ReactNode } from 'react';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Agrupa todos os providers globais da aplicação.
 * Adicione novos providers aqui conforme necessário (ex: QueryClient, Auth, Toast).
 */
export function AppProviders({ children }: AppProvidersProps) {
  return <>{children}</>;
}
