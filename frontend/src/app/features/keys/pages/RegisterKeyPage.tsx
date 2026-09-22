import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/app/shared/components/ui/page-header';
import { Label } from '@/app/shared/components/ui/label';
import { Input } from '@/app/shared/components/ui/input';
import { Button } from '@/app/shared/components/ui/button';
import { pixKeyMeta } from '../lib/pixKeyMeta';
import { registerKeySchema, type RegisterKeyFormData } from '../schemas/registerKey.schema';
import type { PixKeyType } from '../types';

export function RegisterKeyPage() {
  const { type } = useParams<{ type: PixKeyType }>();
  const navigate = useNavigate();

  if (!type || !(type in pixKeyMeta)) return null;

  const meta = pixKeyMeta[type];

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterKeyFormData>({
    resolver: zodResolver(registerKeySchema(type)),
    mode: 'onChange',
  });

  const value = watch('value');

  function onSubmit(data: RegisterKeyFormData) {
    navigate('/keys');
  }

  return (
    <div className="flex min-h-screen flex-col pb-6">
      <PageHeader
        title={`Registrar ${meta.label.toLowerCase()}`}
        subtitle={`Preencha a chave do tipo ${meta.label} que você quer utilizar para receber transferências por PIX.`}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col px-4">
        <div className="mt-6 flex-1">
          <Label htmlFor="pix-key-value">{meta.label}</Label>
          <Input
            id="pix-key-value"
            className="mt-2"
            placeholder={type === 'email' ? 'seuemail@exemplo.com' : ''}
            {...register('value')}
          />
          {value && value.length > 0 && (
            <p className={`mt-1 text-xs ${errors.value ? 'text-text-negative' : 'text-brand-element'}`}>
              {errors.value ? errors.value.message : 'Chave válida'}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={!isValid}>
          Confirmar
        </Button>
      </form>
    </div>
  );
}