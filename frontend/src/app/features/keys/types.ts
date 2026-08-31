export type PixKeyType = 'cpf' | 'email' | 'phone' | 'random';
export type PixKeyStatus = 'active' | 'suspended';

export interface PixKey {
  id: string;
  type: PixKeyType;
  value: string;
  status: PixKeyStatus;
}