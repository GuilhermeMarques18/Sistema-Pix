'use client';

import { useState, useRef, useEffect } from 'react';
import { CalendarBlank, CaretDown } from '@phosphor-icons/react';
import type { PeriodFilter, PeriodOption } from '../types/extrato.types';

const PERIOD_OPTIONS: PeriodOption[] = [
  { label: 'Últimos 7 dias', value: '7' },
  { label: 'Últimos 30 dias', value: '30' },
  { label: 'Últimos 90 dias', value: '90' },
  { label: 'Todos', value: 'all' },
];

interface ExtratoPeriodFilterProps {
  period: PeriodFilter;
  onChange: (period: PeriodFilter) => void;
}

export function ExtratoPeriodFilter({ period, onChange }: ExtratoPeriodFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = PERIOD_OPTIONS.find((o) => o.value === period) ?? PERIOD_OPTIONS[1];

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="px-4 pb-4">
      <p className="text-xs text-text-secondary mb-2">Período</p>

      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex w-full items-center gap-3 rounded-xl bg-bg-input px-4 py-3
            text-sm text-text transition-colors hover:bg-bg-input-hover active:scale-[0.99]
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-logo"
        >
          <CalendarBlank size={18} weight="regular" className="text-text-secondary flex-shrink-0" />
          <span className="flex-1 text-left">{selected.label}</span>
          <CaretDown
            size={16}
            weight="regular"
            className={`text-text-secondary transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <ul
            role="listbox"
            aria-label="Selecionar período"
            className="absolute left-0 right-0 top-full z-20 mt-1 rounded-xl bg-bg-input
              border border-border shadow-lg overflow-hidden"
          >
            {PERIOD_OPTIONS.map((option) => (
              <li key={option.value} role="option" aria-selected={option.value === period}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left text-sm transition-colors
                    hover:bg-bg-input-hover active:scale-[0.99]
                    ${option.value === period ? 'text-brand-element font-medium' : 'text-text'}`}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
