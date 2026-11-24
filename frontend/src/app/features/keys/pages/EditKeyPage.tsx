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
import { formatPhoneInput, normalizePhoneKey } from '../lib/formatPixKey';
import { usePixKeys } from '../hooks/usePixKeys';
import { registerKeySchema, type RegisterKeyFormData } from '../schemas/registerKey.schema';
import { KeyEndpointUnavailableError } from '../services/pixKeys.service';

export function EditKeyPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { keys, isLoading, updateKey } = usePixKeys();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const target = keys.find((k) => k.id === id);
  const type = target?.type ?? 'cpf';
  const canEdit = type === 'email' || type === 'phone' || type === 'random';
  const meta = pixKeyMeta[type];

  const schema = useMemo(() => registerKeySchema(type), [type]);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<RegisterKeyFormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { value: '' },
  });
  const valueField = register('value');

  useEffect(() => {
    if (target) reset({ value: target.type === 'phone' ? formatPhoneInput(target.value) : target.value });
  }, [target, reset]);

  const value = watch('value');
  const unchanged = !!target && (target.type === 'phone'
    ? normalizePhoneKey(value) === normalizePhoneKey(target.value)
    : value === target.value);

  async function onSubmit(data: RegisterKeyFormData) {
    if (!target || !canEdit || target.type === 'random') return;
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

  async function handleRegenerate() {
    if (!target || target.type !== 'random' || isRegenerating) return;
    setSubmitError(null);
    setIsRegenerating(true);
    try {
      await updateKey(target);
      navigate('/keys');
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Não foi possível gerar uma nova chave aleatória.'));
    } finally {
      setIsRegenerating(false);
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

  if (!canEdit) {
    return (
      <div className="px-4 pt-6">
        <p className="text-sm text-text-secondary">
          Chaves de CPF e CNPJ não podem ser alteradas.
        </p>
        <Button className="mt-3" size="sm" variant="outline" onClick={() => navigate('/keys')}>
          Voltar para minhas chaves
        </Button>
      </div>
    );
  }

  if (target.type === 'random') {
    return (
      <div className="flex min-h-screen flex-col pb-6">
        <PageHeader
          title="Alterar chave aleatória"
          subtitle="Uma nova chave será gerada automaticamente."
        />
        <div className="flex flex-1 flex-col px-4">
          <div className="mt-6 flex-1">
            <p className="text-sm text-text-secondary">
              Ao confirmar, sua chave atual será substituída por uma nova chave aleatória.
            </p>
            {submitError && (
              <p role="alert" className="mt-3 text-sm text-text-negative">
                {submitError}
              </p>
            )}
          </div>
          <Button type="button" className="w-full" size="lg" disabled={isRegenerating} onClick={handleRegenerate}>
            {isRegenerating ? 'Gerando...' : 'Gerar nova chave'}
          </Button>
        </div>
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
          <Input
            id="pix-key-edit-value"
            className="mt-2"
            type={type === 'phone' ? 'tel' : 'text'}
            {...valueField}
            onChange={(event) => {
              if (type === 'phone') {
                setValue('value', formatPhoneInput(event.target.value), { shouldValidate: true, shouldDirty: true });
              } else {
                void valueField.onChange(event);
              }
            }}
          />
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
