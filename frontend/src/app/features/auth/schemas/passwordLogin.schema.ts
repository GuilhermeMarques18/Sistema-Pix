import { z } from 'zod';

/**
 * Schema para a tela de login por senha.
 * Utilizado quando o usuário já está identificado (e-mail salvo) e
 * precisa apenas confirmar a senha.
 */
export const passwordLoginSchema = z.object({
  password: z
    .string({ required_error: 'Senha obrigatória.' })
    .min(6, 'A senha deve ter no mínimo 6 caracteres.'),
});

export type PasswordLoginFormData = z.infer<typeof passwordLoginSchema>;
