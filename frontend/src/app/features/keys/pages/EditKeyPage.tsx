import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/app/shared/components/ui/page-header';
import { Label } from '@/app/shared/components/ui/label';
import { Input } from '@/app/shared/components/ui/input';
import { Button } from '@/app/shared/components/ui/button';
import { getApiErrorMessage } from '@/app/shared/lib/apiError';
import { pixKeyMeta } from '../lib/pixKeyMeta';
import { usePixKeys } from '../hooks/usePixKeys';
import { registerKeySchema, type RegisterKeyFormData } from '../schemas/registerKey.schema';
import { KeyEndpointUnavailableError } from '../services/pixKeys.service';

export function EditKeyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { keys, isLoading, updateKey } = usePixKeys();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const target = keys.find((k) => k.id === id);
  const type = target?.type ?? 'cpf';
  const meta = pixKeyMeta[type];

  const schema = useMemo(() => registerKeySchema(type), [type]);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterKeyFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { value: '' },
  });

  useEffect(() => {
    if (target) reset({ value: target.value });
  }, [target, reset]);

  const value = watch('value');
  const unchanged = !!target && value === target.value;

  async function onSubmit(data: RegisterKeyFormData) {
    if (!target) return;
    setSubmitError(null);
    try {
      await updateKey(target, data.value);
      navigate('/keys');
    } catch (err) {
      setSubmitError(
        err instanceof KeyEndpointUnavailableError
          ? err.message
          : getApiErrorMessage(err, 'Não foi possível alterar a chave.'),
      );
    }
  }

  if (isLoading) {
    return <p className="px-4 pt-6 text-sm text-text-secondary">Carregando...</p>;
  }

  if (!target) {
    return (
      <div className="px-4 pt-6">
        <p className="text-sm text-text-negative">Chave não encontrada.</p>
        <Button className="mt-3" size="sm" variant="outline" onClick={() => navigate('/keys')}>
          Voltar para minhas chaves
        </Button>
      </div>
    );
  }

  if (target.type === 'random') {
    return (
      <div className="px-4 pt-6">
        <p className="text-sm text-text-secondary">
          Chaves aleatórias não podem ser alteradas. Se precisar de outra, cadastre uma nova.
        </p>
        <Button className="mt-3" size="sm" variant="outline" onClick={() => navigate('/keys')}>
          Voltar para minhas chaves
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col pb-6">
      <PageHeader
        title={`Alterar ${meta.label.toLowerCase()}`}
        subtitle="Informe o novo valor da chave PIX associada à sua conta."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col px-4">
        <div className="mt-6 flex-1">
          <Label htmlFor="pix-key-edit-value">{meta.label}</Label>
          <Input id="pix-key-edit-value" className="mt-2" {...register('value')} />
          {value && value.length > 0 && !unchanged && (
            <p
              className={`mt-1 text-xs ${errors.value ? 'text-text-negative' : 'text-brand-element'}`}
            >
              {errors.value ? String(errors.value.message) : 'Chave válida'}
            </p>
          )}
          {submitError && (
            <p role="alert" className="mt-3 text-sm text-text-negative">
              {submitError}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={!isValid || unchanged || isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Salvar alteração'}
        </Button>
      </form>
    </div>
  );
}
