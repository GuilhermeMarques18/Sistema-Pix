'use client';

import { useState } from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/app/shared/components/ui/button';

interface ExtratoBalanceHeaderProps {
  balance: number;
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ExtratoBalanceHeader({ balance }: ExtratoBalanceHeaderProps) {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-4 pb-3">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        aria-label="Voltar para o início"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-element
          text-brand-element transition-colors hover:bg-brand-element/10 active:scale-95 mb-5"
      >
        {/* ArrowLeft via Phosphor */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 256 256"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M224,128a8,8,0,0,1-8,8H59.31l58.35,58.34a8,8,0,0,1-11.32,11.32l-72-72a8,8,0,0,1,0-11.32l72-72a8,8,0,0,1,11.32,11.32L59.31,120H216A8,8,0,0,1,224,128Z" />
        </svg>
      </button>

      {/* Saldo atual */}
      <p className="text-xs text-text-secondary mb-1">Saldo atual</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-title font-bold text-text">
            {visible ? formatBRL(balance) : 'R$ ••••••'}
          </span>
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Ocultar saldo' : 'Mostrar saldo'}
            className="text-text-secondary hover:text-text transition-colors"
          >
            {visible ? <EyeSlash size={20} weight="regular" /> : <Eye size={20} weight="regular" />}
          </button>
        </div>

        {/* Pix button */}
        <Button
          type="button"
          onClick={() => navigate('/chaves')}
          className="rounded-xl px-5 h-9 text-sm font-semibold"
        >
          Pix
        </Button>
      </div>
    </div>
  );
}
