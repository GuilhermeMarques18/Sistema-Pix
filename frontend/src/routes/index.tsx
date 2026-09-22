import { Routes, Route, Navigate } from 'react-router-dom';
import { useUnauthorized } from '@/app/shared/hooks';
import { LoginPage } from '@/app/features/auth';
import { DashboardPage } from '@/app/features/dashboard';
import { ExtratoPage } from '@/app/features/extrato';
import { InitPage } from '@/app/features/init';
import { RegisterPage } from '@/app/features/register';
import { AppShellLayout } from '@/app/layout';

// Importações das novas páginas
import { KeysPage } from '@/app/features/keys/pages/KeysPage';
import { NewKeyPage } from '@/app/features/keys/pages/NewKeyPage';
import { RegisterKeyPage } from '@/app/features/keys/pages/RegisterKeyPage';
import { ProfilePage } from '@/app/features/profile/pages/ProfilePage';
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
        <Route path="/keys">
          <Route index element={<KeysPage />} />
          <Route path="new" element={<NewKeyPage />} />
          <Route path="new/:type" element={<RegisterKeyPage />} />
        </Route>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/ajustes" element={<div className="p-8 text-text">Ajustes</div>} />
      </Route>

      {/* Rota de fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
