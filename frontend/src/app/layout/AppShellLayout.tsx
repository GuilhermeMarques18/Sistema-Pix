'use client';

import { Outlet } from 'react-router-dom';
import { BottomNav } from '@/app/shared/components/ui/BottomNav';

/**
 * Layout com BottomNav fixo.
 * Envolve apenas as rotas que precisam da navegação inferior (dashboard, extrato, chaves, ajustes).
 * Rotas como /login ficam fora desse layout.
 */
export function AppShellLayout() {
  return (
    <div className="relative min-h-screen bg-bg flex justify-center">
      <div className="w-full max-w-md flex flex-col">
        {/* Conteúdo da rota atual */}
        <main className="flex-1 overflow-y-auto pb-24">
          <Outlet />
        </main>

        {/* BottomNav fixo — compartilhado entre todas as rotas filhas */}
        <BottomNav />
      </div>
    </div>
  );
}
