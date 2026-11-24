import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiErrorMessage } from '@/app/shared/lib/apiError';
import { authService } from '../services/auth.service';
import type { LoginFormData } from '../schemas/login.schema';

export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(data: LoginFormData) {
    try {
      setIsLoading(true);
      setError(null);
      await authService.login(data);
      const from = location.state?.from;
      const destination = typeof from === 'string' && /^\/(?![\/\\])/.test(from) && !from.startsWith('/login')
        ? from : '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(axios.isAxiosError(err) && err.response?.status === 401
        ? 'Credenciais inválidas. Verifique seu e-mail e senha.'
        : getApiErrorMessage(err, 'Não foi possível entrar. Tente novamente.'));
    } finally {
      setIsLoading(false);
    }
  }

  return { login, isLoading, error };
}
