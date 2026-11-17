import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/app/shared/components/ui/page-header';
import { Label } from '@/app/shared/components/ui/label';
import { Input } from '@/app/shared/components/ui/input';
import { Button } from '@/app/shared/components/ui/button';
import { getApiErrorMessage } from '@/app/shared/lib/apiError';
import { useCurrentUser } from '@/app/shared/hooks';
import { pixKeyMeta } from '../lib/pixKeyMeta';
import { usePixKeys } from '../hooks/usePixKeys';
import { registerKeySchema, type RegisterKeyFormData } from '../schemas/registerKey.schema';
import type { PixKeyType } from '../types';

export function RegisterKeyPage() {
  const params = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { createKey } = usePixKeys();
  const { user } = useCurrentUser();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Os hooks vêm sempre antes de qualquer return antecipado (regra dos hooks)
  const isKnownType = !!params.type && params.type in pixKeyMeta;
  const type = (isKnownType ? params.type : 'cpf') as PixKeyType;
  const meta = pixKeyMeta[type];
  const isRandom = type === 'random';

  const schema = useMemo(() => registerKeySchema(type), [type]);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterKeyFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { value: '' },
  });

  // O backend só aceita a chave se pertencer ao próprio usuário (CPF, e-mail ou telefone dele),
  // então já sugerimos o valor do cadastro.
  useEffect(() => {
    if (!user || isRandom) return;
    const own: Partial<Record<PixKeyType, string>> = {
      cpf: user.tipoPessoa === 'FISICA' ? user.documento : undefined,
      cnpj: user.tipoPessoa === 'JURIDICA' ? user.documento : undefined,
      email: user.email,
      phone: user.telefone,
    };
    const suggestion = own[type];
    if (suggestion) setValue('value', suggestion, { shouldValidate: true });
  }, [user, type, isRandom, setValue]);

  if (!isKnownType) return null;

  const value = watch('value');

  async function onSubmit(data: RegisterKeyFormData) {
    setSubmitError(null);
    try {
      await createKey(type, data.value);
      navigate('/keys');
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Não foi possível cadastrar a chave.'));
    }
  }

  return (
    <div className="flex min-h-screen flex-col pb-6">
      <PageHeader
        title={isRandom ? 'Gerar chave aleatória' : `Registrar ${meta.label.toLowerCase()}`}
        subtitle={
          isRandom
            ? 'Vamos gerar uma chave aleatória para você receber transferências por PIX.'
            : `Preencha a chave do tipo ${meta.label} que você quer utilizar para receber transferências por PIX.`
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col px-4">
        <div className="mt-6 flex-1">
          {!isRandom && (
            <>
              <Label htmlFor="pix-key-value">{meta.label}</Label>
              <Input
                id="pix-key-value"
                className="mt-2"
                placeholder={type === 'email' ? 'seuemail@exemplo.com' : ''}
                {...register('value')}
              />
              {value && value.length > 0 && (
                <p
                  className={`mt-1 text-xs ${errors.value ? 'text-text-negative' : 'text-brand-element'}`}
                >
                  {errors.value ? String(errors.value.message) : 'Chave válida'}
                </p>
              )}
            </>
          )}

          {submitError && <p className="mt-3 text-sm text-text-negative">{submitError}</p>}
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={(!isRandom && !isValid) || isSubmitting}
        >
          {isSubmitting ? 'Enviando...' : isRandom ? 'Gerar chave' : 'Confirmar'}
        </Button>
      </form>
    </div>
  );
}
