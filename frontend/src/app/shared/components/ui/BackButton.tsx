'use client';

import { ArrowLeft } from '@phosphor-icons/react';

interface BackButtonProps {
  onClick: () => void;
  /** Texto alternativo para acessibilidade */
  label?: string;
}

export function BackButton({ onClick, label = 'Voltar' }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-element
        text-brand-element transition-colors hover:bg-brand-element/10 active:scale-95
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-logo"
    >
      <ArrowLeft size={20} weight="bold" />
    </button>
  );
}
