import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import type { UserRole } from '@/app/shared/types/api.types';
import { useSession } from './SessionProvider';

export function RequireSession({ roles }: { roles?: readonly UserRole[] }) {
  const { status, user, error, reload, logout } = useSession();
  const location = useLocation();

  if (status === 'loading') {
    return <p role="status" className="p-6 text-center text-text-secondary">Carregando sua sessão...</p>;
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}${location.hash}` }} />;
  }

  if (status === 'error') {
    return (
      <div role="alert" className="mx-auto flex max-w-sm flex-col gap-4 p-6 text-center text-text">
        <p>{error}</p>
        <button className="rounded-lg bg-brand-element p-3" onClick={() => { void reload(); }}>Tentar novamente</button>
        <button className="underline" onClick={logout}>Ir para o login</button>
      </div>
    );
  }

  if (roles && (!user || !roles.includes(user.role))) {
    return (
      <div role="alert" className="p-6 text-center text-text">
        <p>Você não tem permissão para acessar esta área.</p>
        <Link to="/dashboard" className="text-brand-element underline">Voltar ao início</Link>
      </div>
    );
  }

  return <Outlet />;
}
