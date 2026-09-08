import { Routes, Route, Navigate } from 'react-router-dom';
import { useUnauthorized } from '@/app/shared/hooks';
import { LoginPage } from '@/app/features/auth';
import { DashboardPage } from '@/app/features/dashboard';
import { ExtratoPage } from '@/app/features/extrato';
import { InitPage } from '@/app/features/init';
import { RegisterPage } from '@/app/features/register';
import { AppShellLayout } from '@/app/layout';

/**
 * Definição central de todas as rotas da aplicação.
 * Adicione novas rotas aqui conforme as features forem criadas.
 */
export function AppRoutes() {
  useUnauthorized();

  return (
    <Routes>
      {/* Tela inicial — splash com botões Entrar / Cadastre-se */}
      <Route path="/" element={<InitPage />} />

      {/* Auth — sem BottomNav */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rotas com BottomNav — conteúdo fica no <Outlet> do AppShellLayout */}
      <Route element={<AppShellLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/extrato" element={<ExtratoPage />} />
        <Route path="/chaves" element={<div className="p-8 text-text">Chaves Pix</div>} />
        <Route path="/ajustes" element={<div className="p-8 text-text">Ajustes</div>} />
      </Route>

      {/* Rota de fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
