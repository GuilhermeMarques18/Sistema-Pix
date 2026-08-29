import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import '@/assets/styles/globals.css';

/**
 * BrowserRouter carregado apenas no client-side.
 * Necessário porque BrowserRouter acessa `document`, que não existe no SSR do Next.js.
 */
const ClientApp = dynamic(
  () => import('@/app/core/ClientApp').then((mod) => mod.ClientApp),
  { ssr: false }
);

export default function App({ Component, pageProps }: AppProps) {
  return <ClientApp Component={Component} pageProps={pageProps} />;
}
