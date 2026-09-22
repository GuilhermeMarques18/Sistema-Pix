import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'E-mail obrigatório.' })
    .email('Informe um e-mail válido.'),
  password: z
    .string({ required_error: 'Senha obrigatória.' })
    .min(6, 'A senha deve ter no mínimo 6 caracteres.'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
