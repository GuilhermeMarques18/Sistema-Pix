import { CaretRightIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/app/shared/components/ui/page-header';
import { pixKeyMeta } from '../lib/pixKeyMeta';
import { usePixKeys } from '../hooks/usePixKeys';
import type { PixKeyType } from '../types';
import { useCurrentUser } from '@/app/shared/hooks';
import { Button } from '@/app/shared/components/ui/button';

export function NewKeyPage() {
  const navigate = useNavigate();
  const { keys, isLoading, error, reload } = usePixKeys();
  const { user } = useCurrentUser();
  const order: PixKeyType[] = [user?.tipoPessoa === 'JURIDICA' ? 'cnpj' : 'cpf', 'email', 'phone', 'random'];

  // O backend só permite 1 chave por tipo na mesma conta
  const registeredTypes = new Set(keys.map((k) => k.type));

  return (
    <div className="pb-6">
      <PageHeader title="Nova chave PIX" subtitle="Crie uma chave para fazer transferência" />

      <div className="mt-6 flex flex-col gap-3 px-4">
        {isLoading && <p role="status" className="text-text-secondary">Carregando suas chaves...</p>}
        {error && <div role="alert" className="text-text-negative">{error}<Button onClick={() => void reload()}>Tentar novamente</Button></div>}
        {order.map((type) => {
          const meta = pixKeyMeta[type];
          const Icon = meta.icon;
          const alreadyRegistered = registeredTypes.has(type);
          return (
            <button
              key={type}
              disabled={alreadyRegistered || isLoading || !!error || !user}
              onClick={() => navigate(`/keys/new/${type}`)}
              className="flex items-center justify-between rounded-xl bg-bg-input/40 px-4 py-3 text-left transition-colors hover:bg-bg-input active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-logo disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-bg-input/40 disabled:active:scale-100"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-element/15 text-brand-element">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-text">{meta.label}</p>
                  <p className="text-xs text-text-secondary">
                    {alreadyRegistered ? 'Você já possui uma chave deste tipo' : meta.description}
                  </p>
                </div>
              </div>
              <CaretRightIcon className="h-4 w-4 text-text-secondary" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
