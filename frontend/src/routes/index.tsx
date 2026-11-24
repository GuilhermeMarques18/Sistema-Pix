import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireSession } from '@/app/core/auth/RequireSession';
import { LoginPage } from '@/app/features/auth';
import { DashboardPage } from '@/app/features/dashboard';
import { ExtratoPage } from '@/app/features/extrato';
import { InitPage } from '@/app/features/init';
import { RegisterPage } from '@/app/features/register';
import { AjustesPage } from '@/app/features/settings';
import { AppShellLayout } from '@/app/layout';
import { KeysPage } from '@/app/features/keys/pages/KeysPage';
import { NewKeyPage } from '@/app/features/keys/pages/NewKeyPage';
import { RegisterKeyPage } from '@/app/features/keys/pages/RegisterKeyPage';
import { EditKeyPage } from '@/app/features/keys/pages/EditKeyPage';
import { ProfilePage } from '@/app/features/profile/pages/ProfilePage';
import { ReceivePage } from '@/app/features/receive/pages/ReceivePage';
import { AdminPage } from '@/app/features/admin/pages/AdminPage';
import { AccountPendingPage } from '@/app/features/admin/pages/AccountPendingPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Splash */}
      <Route path="/" element={<InitPage />} />

      {/* Auth — sem layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Conta pendente de aprovação */}
      <Route path="/conta-pendente" element={<AccountPendingPage />} />

      {/* Rotas autenticadas */}
      <Route element={<RequireSession />}>
        <Route element={<AppShellLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/extrato" element={<ExtratoPage />} />
          <Route path="/receive" element={<ReceivePage />} />
          <Route path="/keys">
            <Route index element={<KeysPage />} />
            <Route path="new" element={<NewKeyPage />} />
            <Route path="new/:type" element={<RegisterKeyPage />} />
            <Route path=":id/edit" element={<EditKeyPage />} />
          </Route>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/ajustes" element={<AjustesPage />} />

          {/* Painel admin — protegido por role ADMIN/OWNER */}
          <Route element={<RequireSession roles={['ADMIN', 'OWNER']} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
