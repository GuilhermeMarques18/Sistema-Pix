'use client';

import { useState } from 'react';
import {
  ArrowLineDown,
  ArrowLineUp,
  CalendarBlank,
  ListBullets,
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { SendPixFlow } from '@/app/features/extrato/pix-send';

interface QuickActionsProps {
  onRefresh: () => Promise<unknown>;
  blocked: boolean;
}

export function QuickActions({ onRefresh, blocked }: QuickActionsProps) {
  const navigate = useNavigate();
  const [sendPixOpen, setSendPixOpen] = useState(false);
  const [scheduled, setScheduled] = useState(false);

  async function refreshAfterPix() {
    await onRefresh();
    if (scheduled) window.dispatchEvent(new Event('scheduled-pix-updated'));
  }

  const actions = [
    { icon: ArrowLineDown, label: 'Receber', onClick: () => navigate('/receive'), disabled: false },
    { icon: ArrowLineUp, label: 'Enviar', onClick: () => { setScheduled(false); setSendPixOpen(true); }, disabled: blocked },
    { icon: CalendarBlank, label: 'Agendar', onClick: () => { setScheduled(true); setSendPixOpen(true); }, disabled: blocked },
    { icon: ListBullets,   label: 'Extrato', onClick: () => navigate('/extrato') },
  ];

  return (
    <>
      <div className="px-4 pt-5 pb-2">
        <div className="grid grid-cols-4 gap-2">
          {actions.map(({ icon: Icon, label, onClick, disabled }) => (
            <button
              key={label}
              onClick={onClick}
              disabled={disabled}
              className="flex flex-col items-center gap-2 rounded-xl bg-bg-input p-3 sm:p-4 text-brand-element
                hover:bg-bg-input-hover active:scale-95 transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-logo disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label={label}
            >
              <Icon size={28} weight="regular" />
              <span className="text-sm text-text">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {sendPixOpen && (
        <SendPixFlow
          scheduled={scheduled}
          onCompleted={refreshAfterPix}
          onClose={() => { setSendPixOpen(false); void onRefresh(); }}
        />
      )}
    </>
  );
}
