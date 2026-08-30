import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import type { LoginFormData } from '../schemas/login.schema';

export function useLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(data: LoginFormData) {
    try {
      setIsLoading(true);
      setError(null);
      await authService.login(data);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setIsLoading(false);
    }
  }

  return { login, isLoading, error };
}
