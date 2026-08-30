'use client';

import {
  ArrowLineDown,
  ArrowLineUp,
  CalendarBlank,
  ListBullets,
  type Icon,
} from '@phosphor-icons/react';

interface QuickActionConfig {
  PhosphorIcon: Icon;
  label: string;
  onClick?: () => void;
}

const ACTION_CONFIG: QuickActionConfig[] = [
  { PhosphorIcon: ArrowLineDown, label: 'Receber' },
  { PhosphorIcon: ArrowLineUp,   label: 'Enviar'  },
  { PhosphorIcon: CalendarBlank, label: 'Agendar' },
  { PhosphorIcon: ListBullets,   label: 'Extrato' },
];

export function QuickActions() {
  return (
    <div className="px-4 pt-5 pb-2">
      <div className="grid grid-cols-4 gap-2">
        {ACTION_CONFIG.map(({ PhosphorIcon, label, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="flex flex-col items-center gap-2 rounded-xl bg-bg-input p-3 text-brand-element
              hover:bg-[#2a3035] active:scale-95 transition-all duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-logo"
            aria-label={label}
          >
            <PhosphorIcon size={24} weight="regular" />
            <span className="text-xs text-text">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
