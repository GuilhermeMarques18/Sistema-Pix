'use client';

import { ReactNode } from 'react';

interface RootLayoutProps {
  children: ReactNode;
}

/**
 * Layout raiz da aplicação.
 * Envolve todas as páginas com estrutura comum (ex: header, sidebar, footer).
 */
export function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen bg-bg text-text">
      {children}
    </div>
  );
}
