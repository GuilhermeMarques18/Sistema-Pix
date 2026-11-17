import { PencilSimpleIcon, ProhibitIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { Badge } from '@/app/shared/components/ui/badge';
import { pixKeyMeta } from '../lib/pixKeyMeta';
import { formatPixKey } from '../lib/formatPixKey';
import type { PixKey } from '../types';

interface KeyListItemProps {
  pixKey: PixKey;
  // eslint-disable-next-line no-unused-vars
  onEdit: (pixKey: PixKey) => void;
  // eslint-disable-next-line no-unused-vars
  onToggleStatus: (pixKey: PixKey) => void;
}

export function KeyListItem({ pixKey, onEdit, onToggleStatus }: KeyListItemProps) {
  const meta = pixKeyMeta[pixKey.type];
  const Icon = meta.icon;
  const isActive = pixKey.status === 'active';
  const isRandom = pixKey.type === 'random';

  return (
    <div className="flex items-center justify-between rounded-xl bg-bg-input/40 px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-element/15 text-brand-element">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-text">{meta.label}</p>
          <p className="truncate text-xs text-text-secondary">
            {formatPixKey(pixKey.type, pixKey.value)}
          </p>
          <Badge variant={isActive ? 'success' : 'warning'} className="mt-1">
            {isActive ? 'Ativa' : 'Suspensa'}
          </Badge>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-2 text-xs text-text-secondary">
        {!isRandom && (
          <button
            type="button"
            onClick={() => onEdit(pixKey)}
            aria-label={`Alterar chave ${meta.label}`}
            className="flex flex-col items-center gap-0.5 transition-colors hover:text-text"
          >
            <PencilSimpleIcon className="h-4 w-4" />
            Alterar
          </button>
        )}
        <button
          type="button"
          onClick={() => onToggleStatus(pixKey)}
          aria-label={`${isActive ? 'Suspender' : 'Desbloquear'} chave ${meta.label}`}
          className="flex flex-col items-center gap-0.5 transition-colors hover:text-text"
        >
          {isActive ? <ProhibitIcon className="h-4 w-4" /> : <CheckCircleIcon className="h-4 w-4" />}
          {isActive ? 'Suspender' : 'Desbloquear'}
        </button>
      </div>
    </div>
  );
}
