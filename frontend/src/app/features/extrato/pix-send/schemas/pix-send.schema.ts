import { z } from 'zod';

export const inserirChaveSchema = z.object({
  chavePix: z
    .string()
    .min(1, 'Informe a chave Pix do destinatário')
    .max(77, 'Chave Pix inválida'),
});

export const inserirValorSchema = z.object({
  valor: z
    .string()
    .min(1, 'Informe o valor')
    .refine((v) => {
      const n = parseFloat(v.replace(',', '.'));
      return !isNaN(n) && n > 0;
    }, 'Informe um valor válido maior que zero'),
  descricao: z.string().max(100).optional(),
});

export const senhaSchema = z.object({
  senha: z
    .string()
    .length(4, 'A senha deve ter 4 dígitos')
    .regex(/^\d{4}$/, 'A senha deve conter apenas números'),
});

export type InserirChaveFormValues = z.infer<typeof inserirChaveSchema>;
export type InserirValorFormValues = z.infer<typeof inserirValorSchema>;
export type SenhaFormValues = z.infer<typeof senhaSchema>;
