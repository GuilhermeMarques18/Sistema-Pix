import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenService } from '@/app/core/auth';

/**
 * Escuta o evento customizado disparado pelo interceptor do Axios
 * quando a API retorna 401 e redireciona o usuário para o login.
 */
export function useUnauthorized() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => {
      tokenService.remove();
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, [navigate]);
}
