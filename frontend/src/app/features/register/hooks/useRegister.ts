import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { registerService } from '../services/register.service';
import type { RegisterFormData } from '../schemas/register.schema';

function parseApiError(error: unknown, tipoPessoa: 'FISICA' | 'JURIDICA'): string {
  if (!axios.isAxiosError(error)) {
    return 'Não foi possível criar a conta. Tente novamente.';
  }

  const status = error.response?.status;
  const message: string = error.response?.data?.message ?? '';

  // 409 — conflito de recurso duplicado
  if (status === 409) {
    if (message.toLowerCase().includes('email') || message.toLowerCase().includes('e-mail')) {
      return 'Este e-mail já está cadastrado. Tente fazer login ou use outro e-mail.';
    }
    if (message.toLowerCase().includes('telefone')) {
      return 'Este telefone já está cadastrado. Verifique o número informado.';
    }
    if (message.toLowerCase().includes('cpf')) {
      return 'Este CPF já está cadastrado. Verifique o documento informado.';
    }
    if (message.toLowerCase().includes('cnpj')) {
      return 'Este CNPJ já está cadastrado. Verifique o documento informado.';
    }
    return 'Dados já cadastrados. Verifique as informações ou tente fazer login.';
  }

  // 400 — validação de campo no backend
  if (status === 400) {
    if (message.toLowerCase().includes('cpf') || message.toLowerCase().includes('cnpj')) {
      const doc = tipoPessoa === 'FISICA' ? 'CPF' : 'CNPJ';
      return `${doc} inválido. Verifique o documento informado.`;
    }
    return `Dados inválidos: ${message || 'verifique os campos e tente novamente.'}`;
  }

  // 422 — erro de validação semântica
  if (status === 422) {
    return message || 'Não foi possível processar os dados. Verifique as informações.';
  }

  // 500+
  if (status && status >= 500) {
    return 'Erro no servidor. Tente novamente em alguns instantes.';
  }

  return 'Não foi possível criar a conta. Tente novamente.';
}

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
    } catch (err) {
      setError(parseApiError(err, data.tipoPessoa));
    } finally {
      setIsLoading(false);
    }
  }

  return { register, isLoading, error };
}
