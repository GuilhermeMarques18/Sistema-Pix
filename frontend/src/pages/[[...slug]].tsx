import { AppRoutes } from '@/routes';

/**
 * Catch-all route para que o Next.js repasse todas as URLs para o React Router.
 * Necessário para que a navegação client-side funcione em modo SPA.
 */
export default function CatchAllPage() {
  return <AppRoutes />;
}
