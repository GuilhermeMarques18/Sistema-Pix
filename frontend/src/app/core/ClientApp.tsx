'use client';

import type { AppProps } from 'next/app';
import { BrowserRouter } from 'react-router-dom';
import { AppProviders } from './providers';
import { RootLayout } from '@/app/layout';

/**
 * Wrapper client-only da aplicação.
 * Isolado para que o Next.js não tente executar BrowserRouter no servidor.
 */
export function ClientApp({ Component, pageProps }: AppProps) {
  return (
    <BrowserRouter>
      <AppProviders>
        <RootLayout>
          <Component {...pageProps} />
        </RootLayout>
      </AppProviders>
    </BrowserRouter>
  );
}
