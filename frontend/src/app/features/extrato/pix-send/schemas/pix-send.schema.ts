import { z } from 'zod';
import { parseMoneyToCents } from '../lib/money';

export const inserirChaveSchema = z.object({
  chavePix: z.string().trim().min(1, 'Informe a chave Pix do destinatário').max(77, 'Chave Pix inválida'),
});

export const inserirValorSchema = z.object({
  valor: z.string().refine((value) => parseMoneyToCents(value) !== null, 'Informe um valor positivo com até duas casas decimais.'),
  descricao: z.string().trim().max(100, 'Use no máximo 100 caracteres.').optional(),
});

export const senhaSchema = z.object({
  senha: z.string().min(6, 'Use sua senha de acesso, com pelo menos 6 caracteres.').max(72, 'Senha inválida.'),
});
export type InserirChaveFormValues = z.infer<typeof inserirChaveSchema>;
export type InserirValorFormValues = z.infer<typeof inserirValorSchema>;
export type SenhaFormValues = z.infer<typeof senhaSchema>;
