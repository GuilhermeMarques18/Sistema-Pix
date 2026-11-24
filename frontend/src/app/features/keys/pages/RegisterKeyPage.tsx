import { useEffect, useMemo, useState, useCallback } from 'react';
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
import { formatPhoneInput, formatPixKey, normalizePhoneKey } from '../lib/formatPixKey';
import { usePixKeys } from '../hooks/usePixKeys';
import { pixKeysService } from '../services/pixKeys.service';
import { registerKeySchema, type RegisterKeyFormData } from '../schemas/registerKey.schema';
import type { PixKeyType } from '../types';

export function RegisterKeyPage() {
  const params = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { createKey } = usePixKeys();
  const { user, error: userError } = useCurrentUser();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [validationState, setValidationState] = useState<'idle' | 'checking' | 'valid' | 'invalid' | 'taken'>('idle');

  // Os hooks vêm sempre antes de qualquer return antecipado (regra dos hooks)
  const isKnownType = !!params.type && params.type in pixKeyMeta;
  const type = (isKnownType ? params.type : 'cpf') as PixKeyType;
  const meta = pixKeyMeta[type];
  const isRandom = type === 'random';
  const isCpf = type === 'cpf';
  const isDocument = isCpf || type === 'cnpj';
  const incompatibleDocument = !!user && ((isCpf && user.tipoPessoa !== 'FISICA') || (type === 'cnpj' && user.tipoPessoa !== 'JURIDICA'));

  const validateKey = useCallback(async (keyType: PixKeyType, keyValue: string) => {
    if (!keyValue || isDocument || isRandom) return;
    setValidationState('checking');
    try {
      const normalized = keyType === 'phone' ? normalizePhoneKey(keyValue) : keyValue.trim();
      const result = await pixKeysService.validate(keyType, normalized);
      if (!result.valida) { setValidationState('invalid'); return; }
      if (result.cadastrada) { setValidationState('taken'); return; }
      setValidationState('valid');
    } catch {
      setValidationState('idle');
    }
  }, [isDocument, isRandom]);

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
  const valueField = register('value');

  // O CPF vem da conta; e-mail e telefone são apenas sugeridos e podem ser alterados.
  useEffect(() => {
    if (!user || isRandom) return;
    const own: Partial<Record<PixKeyType, string>> = {
      cpf: user.tipoPessoa === 'FISICA' ? user.documento : undefined,
      cnpj: user.tipoPessoa === 'JURIDICA' ? user.documento : undefined,
      email: user.email,
      phone: user.telefone,
    };
    const suggestion = own[type];
    if (suggestion) setValue('value', type === 'phone' ? formatPhoneInput(suggestion) : suggestion, { shouldValidate: true });
  }, [user, type, isRandom, setValue]);

  if (!isKnownType) return <p role="alert" className="p-4 text-text-negative">Tipo de chave inválido.</p>;
  if (incompatibleDocument) return <p role="alert" className="p-4 text-text-negative">Este documento não corresponde ao tipo da sua conta. <button className="underline" onClick={() => navigate('/keys/new')}>Escolher outra chave</button></p>;

  const value = watch('value');

  // Debounce da validação — dispara 600ms após o usuário parar de digitar
  useEffect(() => {
    if (!value || isDocument || isRandom) { setValidationState('idle'); return; }
    const timer = setTimeout(() => { void validateKey(type, value); }, 600);
    return () => clearTimeout(timer);
  }, [value, type, isDocument, isRandom, validateKey]);

  const validationMessage = {
    idle: null,
    checking: { text: 'Verificando...', color: 'text-text-secondary' },
    valid: { text: 'Chave válida e disponível', color: 'text-brand-element' },
    invalid: { text: 'Formato de chave inválido', color: 'text-text-negative' },
    taken: { text: 'Esta chave já está cadastrada por outro usuário', color: 'text-text-negative' },
  }[validationState];

  async function onSubmit(data: RegisterKeyFormData) {
    setSubmitError(null);
    try {
      await createKey(type, isDocument ? undefined : data.value);
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
              {isDocument ? (
                <>
                  <input type="hidden" {...valueField} />
                  <p id="pix-key-value" className="mt-2 text-sm text-text">
                    {user ? formatPixKey(type, user.documento) : 'Carregando documento da conta...'}
                  </p>
                  <p className="mt-1 text-xs text-text-secondary">O documento da sua conta será usado automaticamente.</p>
                </>
              ) : (
                <Input
                  id="pix-key-value"
                  className="mt-2"
                  placeholder={type === 'email' ? 'seuemail@exemplo.com' : ''}
                  type={type === 'phone' ? 'tel' : 'text'}
                  {...valueField}
                  onChange={(event) => {
                    if (type === 'phone') {
                      setValue('value', formatPhoneInput(event.target.value), { shouldValidate: true });
                    } else {
                      void valueField.onChange(event);
                    }
                  }}
                />
              )}
              {!isDocument && value && value.length > 0 && (
                <p className={`mt-1 text-xs ${errors.value ? 'text-text-negative' : validationMessage ? validationMessage.color : 'text-brand-element'}`}>
                  {errors.value ? String(errors.value.message) : validationMessage?.text}
                </p>
              )}
            </>
          )}

          {submitError && <p className="mt-3 text-sm text-text-negative">{submitError}</p>}
          {userError && <p className="mt-3 text-sm text-text-negative">{userError}</p>}
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={(!isRandom && !isValid) || !user || isSubmitting || validationState === 'taken' || validationState === 'invalid'}
        >
          {isSubmitting ? 'Enviando...' : isRandom ? 'Gerar chave' : 'Confirmar'}
        </Button>
      </form>
    </div>
  );
}
