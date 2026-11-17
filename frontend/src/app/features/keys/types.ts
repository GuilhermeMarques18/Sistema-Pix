export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
export type PixKeyStatus = 'active' | 'suspended';

export interface PixKey {
  id: string;
  type: PixKeyType;
  value: string;
  /**
   * Vem do backend quando o campo "status" existir no PixKeyResponse.
   * Hoje o backend não envia esse campo, então o front assume 'active'.
   */
  status: PixKeyStatus;
}
