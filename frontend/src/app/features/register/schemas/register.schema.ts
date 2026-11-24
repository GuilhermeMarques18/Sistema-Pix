import { z } from 'zod';

// ─── Validação de CPF ─────────────────────────────────────────────────────────
function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  // Rejeita sequências repetidas (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const calcDigit = (slice: string, factor: number) => {
    const sum = slice
      .split('')
      .reduce((acc, d, i) => acc + Number(d) * (factor - i), 0);
    const rem = (sum * 10) % 11;
    return rem >= 10 ? 0 : rem;
  };

  const d1 = calcDigit(digits.slice(0, 9), 10);
  const d2 = calcDigit(digits.slice(0, 10), 11);
  return d1 === Number(digits[9]) && d2 === Number(digits[10]);
}

// ─── Validação de CNPJ ────────────────────────────────────────────────────────
function isValidCNPJ(cnpj: string): boolean {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const calcDigit = (slice: string, weights: number[]) => {
    const sum = slice
      .split('')
      .reduce((acc, d, i) => acc + Number(d) * weights[i], 0);
    const rem = sum % 11;
    return rem < 2 ? 0 : 11 - rem;
  };

  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const d1 = calcDigit(digits.slice(0, 12), w1);
  const d2 = calcDigit(digits.slice(0, 13), w2);
  return d1 === Number(digits[12]) && d2 === Number(digits[13]);
}

// ─── Schema ───────────────────────────────────────────────────────────────────
export const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'Nome obrigatório.' })
      .trim()
      .min(3, 'O nome deve ter no mínimo 3 caracteres.')
      .max(150, 'O nome deve ter no máximo 150 caracteres.'),
    email: z
      .string({ required_error: 'E-mail obrigatório.' })
      .trim()
      .toLowerCase()
      .max(255, 'O e-mail deve ter no máximo 255 caracteres.')
      .email('Informe um e-mail válido.'),
    telefone: z
      .string({ required_error: 'Telefone obrigatório.' })
      .transform((value) => value.trim().replace(/[\s()-]/g, ''))
      .pipe(z.string().regex(/^\+?[0-9]{10,13}$/, 'Informe um telefone válido com DDD.')),
    tipoPessoa: z.enum(['FISICA', 'JURIDICA']),
    documento: z
      .string({ required_error: 'Documento obrigatório.' })
      .transform((value) => value.replace(/[.\/\s-]/g, ''))
      .pipe(z.string().regex(/^\d+$/, 'Informe apenas os dígitos do documento.')),
    password: z
      .string({ required_error: 'Senha obrigatória.' })
      .min(6, 'A senha deve ter no mínimo 6 caracteres.')
      .max(72, 'A senha deve ter no máximo 72 caracteres.')
      .refine((value) => value.trim().length > 0, 'Senha obrigatória.')
      .refine((value) => new TextEncoder().encode(value).length <= 72, 'A senha deve ocupar no máximo 72 bytes em UTF-8.'),
    confirmPassword: z
      .string({ required_error: 'Confirmação de senha obrigatória.' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      if (data.tipoPessoa === 'FISICA') return isValidCPF(data.documento);
      return isValidCNPJ(data.documento);
    },
    (data) => ({
      message:
        data.tipoPessoa === 'FISICA'
          ? 'CPF inválido. Verifique os dígitos informados.'
          : 'CNPJ inválido. Verifique os dígitos informados.',
      path: ['documento'],
    }),
  );

export type RegisterFormData = z.infer<typeof registerSchema>;
