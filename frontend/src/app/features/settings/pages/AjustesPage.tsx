import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CaretRightIcon } from '@phosphor-icons/react';
import { PageHeader } from '@/app/shared/components/ui/page-header';
import { Label } from '@/app/shared/components/ui/label';
import { Input } from '@/app/shared/components/ui/input';
import { Button } from '@/app/shared/components/ui/button';
import { getApiErrorMessage } from '@/app/shared/lib/apiError';
import { useCurrentUser } from '@/app/shared/hooks';
import { limitsSchema, type LimitsFormData } from '../schemas/limits.schema';
import { settingsService, type NotificationChannel } from '../services/settings.service';

export function AjustesPage() {
  const navigate = useNavigate();
  const { user, updateUser, reload } = useCurrentUser();

  const [loadError, setLoadError] = useState<string | null>(null);
  const [limitsMessage, setLimitsMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const channel = user?.notificationType ?? null;
  const [channelMessage, setChannelMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [isSavingChannel, setIsSavingChannel] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LimitsFormData>({
    resolver: zodResolver(limitsSchema),
    defaultValues: { transactionLimit: '', pixLimit: '' },
  });

  // Carrega os limites atuais da conta
  useEffect(() => {
    settingsService
      .getLimits()
      .then((limits) =>
        reset({
          transactionLimit: String(limits.transactionLimit),
          pixLimit: String(limits.pixLimit),
        }),
      )
      .catch((err) => setLoadError(getApiErrorMessage(err, 'Não foi possível carregar seus limites.')));
  }, [reset]);

  async function onSubmitLimits(data: LimitsFormData) {
    setLimitsMessage(null);
    try {
      await settingsService.updateLimits({
        transactionLimit: Number(data.transactionLimit),
        pixLimit: Number(data.pixLimit),
      });
      await reload();
      setLimitsMessage({ ok: true, text: 'Limites atualizados com sucesso.' });
    } catch (err) {
      setLimitsMessage({ ok: false, text: getApiErrorMessage(err, 'Não foi possível salvar os limites.') });
    }
  }

  async function handleChannel(next: NotificationChannel) {
    setIsSavingChannel(true);
    setChannelMessage(null);
    try {
      await updateUser({ notificationType: next });
      setChannelMessage({ ok: true, text: 'Canal de notificação atualizado.' });
    } catch (err) {
      setChannelMessage({ ok: false, text: getApiErrorMessage(err, 'Não foi possível atualizar o canal.') });
    } finally {
      setIsSavingChannel(false);
    }
  }

  return (
    <div className="pb-6">
      <PageHeader title="Ajustes" subtitle="Limites da conta e notificações" />

      <div className="mt-6 flex flex-col gap-6 px-4">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center justify-between rounded-xl bg-bg-input/40 px-4 py-3 text-left transition-colors hover:bg-bg-input active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-logo"
        >
          <span className="text-sm font-medium text-text">Perfil e conta</span>
          <CaretRightIcon className="h-4 w-4 text-text-secondary" />
        </button>

        {/* RF22 — limites */}
        <form onSubmit={handleSubmit(onSubmitLimits)} className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-text">Limites</h2>
          {loadError && <p className="text-xs text-text-negative">{loadError}</p>}

          <div>
            <Label htmlFor="transactionLimit">Limite de transações por dia</Label>
            <Input
              id="transactionLimit"
              inputMode="numeric"
              className="mt-2"
              {...register('transactionLimit')}
            />
            {errors.transactionLimit && (
              <p className="mt-1 text-xs text-text-negative">{errors.transactionLimit.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="pixLimit">Limite de valor por PIX (R$)</Label>
            <Input id="pixLimit" inputMode="numeric" className="mt-2" {...register('pixLimit')} />
            {errors.pixLimit && (
              <p className="mt-1 text-xs text-text-negative">{errors.pixLimit.message}</p>
            )}
          </div>

          {limitsMessage && (
            <p className={`text-xs ${limitsMessage.ok ? 'text-brand-element' : 'text-text-negative'}`}>
              {limitsMessage.text}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar limites'}
          </Button>
        </form>

        {/* RF25 — canal de notificação */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-text">Notificações de PIX</h2>
          <p className="text-xs text-text-secondary">Escolha por onde quer ser avisado.</p>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              variant={channel === 'EMAIL' ? 'default' : 'outline'}
              disabled={isSavingChannel}
              onClick={() => handleChannel('EMAIL')}
            >
              E-mail
            </Button>
            <Button
              className="flex-1"
              variant={channel === 'SMS' ? 'default' : 'outline'}
              disabled={isSavingChannel}
              onClick={() => handleChannel('SMS')}
            >
              SMS
            </Button>
          </div>
          {channelMessage && (
            <p className={`text-xs ${channelMessage.ok ? 'text-brand-element' : 'text-text-negative'}`}>
              {channelMessage.text}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
