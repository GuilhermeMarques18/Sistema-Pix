'use client';

import { Navigate, Outlet } from 'react-router-dom';
import { BottomNav } from '@/app/shared/components/ui/BottomNav';
import { SideNav } from '@/app/shared/components/ui/SideNav';
import { useSession } from '@/app/core/auth/SessionProvider';

/**
 * Layout principal da aplicação.
 * - Redireciona para /conta-pendente se a conta estiver bloqueada (e não for admin).
 * - Mobile: conteúdo centralizado + BottomNav fixo na base.
 * - Desktop (md+): sidebar lateral fixa + conteúdo sem BottomNav.
 */
export function AppShellLayout() {
  const { account, user, isLoading } = useSession();

  if (isLoading) return null;

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER';
  const isAccountBlocked = account?.status === 'BLOQUEADA';

  if (isAccountBlocked && !isAdmin) {
    return <Navigate to="/conta-pendente" replace />;
  }

  return (
    <div className="min-h-screen bg-bg flex">
      <SideNav />
      <div className="min-w-0 flex-1 flex flex-col">
        <main className="w-full flex-1 overflow-y-auto pb-24 md:pb-8">
          <Outlet />
        </main>
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
