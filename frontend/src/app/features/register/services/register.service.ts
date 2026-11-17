import { api } from '@/app/core/http';
import type { RegisterFormData } from '../schemas/register.schema';

interface RegisterPessoaFisicaPayload {
  name: string;
  email: string;
  password: string;
  telefone: string;
  cpf: string;
}

interface RegisterPessoaJuridicaPayload {
  name: string;
  email: string;
  password: string;
  telefone: string;
  cnpj: string;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  telefone: string;
  tipoPessoa: string;
  documento: string;
  createdUser: string;
}

export const registerService = {
  async register(data: RegisterFormData): Promise<RegisterResponse> {
    const { name, email, password, tipoPessoa, documento } = data;
    // Remove tudo que não seja dígito ou +, para satisfazer o padrão do backend: \+?[0-9]{10,13}
    const telefone = data.telefone.replace(/[^\d+]/g, '');

    if (tipoPessoa === 'FISICA') {
      const payload: RegisterPessoaFisicaPayload = {
        name,
        email,
        password,
        telefone,
        cpf: documento,
      };
      const { data: response } = await api.post<RegisterResponse>(
        '/api/users/pessoa-fisica',
        payload,
      );
      return response;
    } else {
      const payload: RegisterPessoaJuridicaPayload = {
        name,
        email,
        password,
        telefone,
        cnpj: documento,
      };
      const { data: response } = await api.post<RegisterResponse>(
        '/api/users/pessoa-juridica',
        payload,
      );
      return response;
    }
  },
};
