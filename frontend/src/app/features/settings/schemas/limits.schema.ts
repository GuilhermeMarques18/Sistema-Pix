import { z } from 'zod';

/**
 * Os campos chegam como texto do <input>; o backend exige inteiros >= 0.
 * A conversão para número é feita no submit.
 */
export const limitsSchema = z.object({
  transactionLimit: z
    .string({ required_error: 'Informe o limite de transações.' })
    .regex(/^\d+$/, 'Use apenas números inteiros (0 ou mais).'),
  pixLimit: z
    .string({ required_error: 'Informe o limite do PIX.' })
    .regex(/^\d+$/, 'Use apenas números inteiros (0 ou mais).'),
});

export type LimitsFormData = z.infer<typeof limitsSchema>;
