import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/app/shared/components/ui/page-header';
import { pixKeyMeta } from '../lib/pixKeyMeta';
import type { PixKeyType } from '../types';

const order: PixKeyType[] = ['cpf', 'email', 'phone', 'random'];

export function NewKeyPage() {
  const navigate = useNavigate();

  return (
    <div className="pb-6">
      <PageHeader title="Nova chave PIX" subtitle="Crie uma chave para fazer transferência" />

      <div className="mt-6 flex flex-col gap-3 px-4">
        {order.map((type) => {
          const meta = pixKeyMeta[type];
          const Icon = meta.icon;
          return (
            <button
              key={type}
              onClick={() => navigate(`/keys/new/${type}`)}
              className="flex items-center justify-between rounded-xl bg-bg-input/40 px-4 py-3 text-left transition-colors hover:bg-bg-input"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-element/15 text-brand-element">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-medium text-text">{meta.label}</p>
                  <p className="text-xs text-text-secondary">{meta.description}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-text-secondary" />
            </button>
          );
        })}
      </div>
    </div>
  );
}