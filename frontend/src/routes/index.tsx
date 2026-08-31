import { Routes, Route, Navigate } from 'react-router-dom';
import { useUnauthorized } from '@/app/shared/hooks';
import { LoginPage } from '@/app/features/auth';
import { DashboardPage } from '@/app/features/dashboard';
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
      {/* Redireciona a raiz para o dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Auth — sem BottomNav */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rotas com BottomNav — conteúdo fica no <Outlet> do AppShellLayout */}
      <Route element={<AppShellLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/extrato" element={<div className="p-8 text-text">Extrato</div>} />
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
