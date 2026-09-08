import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerService } from '../services/register.service';
import type { RegisterFormData } from '../schemas/register.schema';

export function useRegister() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function register(data: RegisterFormData) {
    try {
      setIsLoading(true);
      setError(null);
      await registerService.register(data);
      navigate('/login', { replace: true });
    } catch {
      setError('Não foi possível criar a conta. Verifique os dados e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return { register, isLoading, error };
}
