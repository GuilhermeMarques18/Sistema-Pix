import { Pencil, Ban, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/app/shared/components/ui/badge';
import { pixKeyMeta } from '../lib/pixKeyMeta';
import type { PixKey } from '../types';

interface KeyListItemProps {
  pixKey: PixKey;
  onEdit: (key: PixKey) => void;
  onToggleStatus: (key: PixKey) => void;
}

export function KeyListItem({ pixKey, onEdit, onToggleStatus }: KeyListItemProps) {
  const meta = pixKeyMeta[pixKey.type];
  const Icon = meta.icon;
  const isActive = pixKey.status === 'active';

  return (
    <div className="flex items-center justify-between rounded-xl bg-bg-input/40 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-element/15 text-brand-element">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-medium text-text">{meta.label}</p>
          <p className="text-xs text-text-secondary">{pixKey.value}</p>
          <Badge variant={isActive ? 'success' : 'warning'} className="mt-1">
            {isActive ? 'Ativa' : 'Suspensa'}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 text-xs text-text-secondary">
        <button
          onClick={() => onEdit(pixKey)}
          className="flex flex-col items-center gap-0.5 transition-colors hover:text-text"
        >
          <Pencil className="h-4 w-4" />
          Alterar
        </button>
        <button
          onClick={() => onToggleStatus(pixKey)}
          className="flex flex-col items-center gap-0.5 transition-colors hover:text-text"
        >
          {isActive ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {isActive ? 'Suspender' : 'Ativar'}
        </button>
      </div>
    </div>
  );
}