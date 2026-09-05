import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'Nome obrigatório.' })
      .min(3, 'O nome deve ter no mínimo 3 caracteres.'),
    email: z
      .string({ required_error: 'E-mail obrigatório.' })
      .email('Informe um e-mail válido.'),
    telefone: z
      .string({ required_error: 'Telefone obrigatório.' })
      .min(10, 'Informe um telefone válido com DDD.'),
    tipoPessoa: z.enum(['FISICA', 'JURIDICA']),
    documento: z
      .string({ required_error: 'Documento obrigatório.' })
      .min(11, 'Informe um documento válido.'),
    password: z
      .string({ required_error: 'Senha obrigatória.' })
      .min(6, 'A senha deve ter no mínimo 6 caracteres.'),
    confirmPassword: z
      .string({ required_error: 'Confirmação de senha obrigatória.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
