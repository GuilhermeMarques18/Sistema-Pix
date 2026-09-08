import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';
import '@/assets/styles/globals.css';

/**
 * BrowserRouter carregado apenas no client-side.
 * Necessário porque BrowserRouter acessa `document`, que não existe no SSR do Next.js.
 */
const ClientApp = dynamic(
  () => import('@/app/core/ClientApp').then((mod) => mod.ClientApp),
  { ssr: false }
) as ComponentType<AppProps>;

export default function App({ Component, pageProps, router }: AppProps) {
  return <ClientApp Component={Component} pageProps={pageProps} router={router} />;
}
