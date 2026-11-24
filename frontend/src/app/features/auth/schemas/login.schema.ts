import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'E-mail obrigatório.' })
    .trim()
    .toLowerCase()
    .max(255, 'O e-mail deve ter no máximo 255 caracteres.')
    .email('Informe um e-mail válido.'),
  password: z
    .string({ required_error: 'Senha obrigatória.' })
    .min(6, 'A senha deve ter no mínimo 6 caracteres.')
    .max(72, 'A senha deve ter no máximo 72 caracteres.')
    .refine((value) => value.trim().length > 0, 'Senha obrigatória.'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
