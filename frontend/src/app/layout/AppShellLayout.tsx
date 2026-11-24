'use client';

import { Outlet } from 'react-router-dom';
import { BottomNav } from '@/app/shared/components/ui/BottomNav';
import { SideNav } from '@/app/shared/components/ui/SideNav';

/**
 * Layout principal da aplicação.
 * - Mobile: conteúdo centralizado + BottomNav fixo na base.
 * - Desktop (md+): sidebar lateral fixa + conteúdo centralizado sem BottomNav.
 */
export function AppShellLayout() {
  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar — visível apenas em md+ */}
      <SideNav />

      {/* Área de conteúdo */}
      <div className="min-w-0 flex-1 flex flex-col">
        <main className="w-full flex-1 overflow-y-auto pb-24 md:pb-8">
          <Outlet />
        </main>

        {/* BottomNav — visível apenas no mobile */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
