import { z } from 'zod';

/**
 * Schema para a tela de login por senha.
 */
export const passwordLoginSchema = z.object({
  email: z
    .string({ required_error: 'E-mail obrigatório.' })
    .email('Informe um e-mail válido.'),
  password: z
    .string({ required_error: 'Senha obrigatória.' })
    .min(6, 'A senha deve ter no mínimo 6 caracteres.'),
});

export type PasswordLoginFormData = z.infer<typeof passwordLoginSchema>;
