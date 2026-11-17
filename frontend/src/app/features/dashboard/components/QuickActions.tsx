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
  availableBalance: number;
  pixLimit: number;
}

export function QuickActions({ availableBalance, pixLimit }: QuickActionsProps) {
  const navigate = useNavigate();
  const [sendPixOpen, setSendPixOpen] = useState(false);

  const actions = [
    { icon: ArrowLineDown, label: 'Receber', onClick: () => {} },
    { icon: ArrowLineUp,   label: 'Enviar',  onClick: () => setSendPixOpen(true) },
    { icon: CalendarBlank, label: 'Agendar', onClick: () => {} },
    { icon: ListBullets,   label: 'Extrato', onClick: () => navigate('/extrato') },
  ];

  return (
    <>
      <div className="px-4 pt-5 pb-2">
        <div className="grid grid-cols-4 gap-2">
          {actions.map(({ icon: Icon, label, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex flex-col items-center gap-2 rounded-xl bg-bg-input p-4 text-brand-element
                hover:bg-bg-input-hover active:scale-95 transition-all duration-150
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-logo"
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
          availableBalance={availableBalance}
          pixLimit={pixLimit}
          onClose={() => setSendPixOpen(false)}
        />
      )}
    </>
  );
}
