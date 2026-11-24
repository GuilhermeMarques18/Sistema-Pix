import { api } from '@/app/core/http';
import type { RegisterFormData } from '../schemas/register.schema';
import type { UserProfile } from '@/app/shared/types/api.types';

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

export type RegisterResponse = UserProfile;

export const registerService = {
  async register(data: RegisterFormData): Promise<RegisterResponse> {
    const { password, tipoPessoa } = data;
    const name = data.name.trim();
    const email = data.email.trim().toLowerCase();
    const documento = data.documento.replace(/[.\/\s-]/g, '');
    const telefone = data.telefone.trim().replace(/[\s()-]/g, '');

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
