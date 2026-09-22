'use client';

import { useState } from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/app/shared/components/ui/button';
import { BackButton } from '@/app/shared/components/ui';

interface ExtratoBalanceHeaderProps {
  balance: number;
  onPixClick: () => void;
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ExtratoBalanceHeader({ balance, onPixClick }: ExtratoBalanceHeaderProps) {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="px-4 pt-4 pb-3">
      {/* Back button */}
      <div className="mb-5">
        <BackButton onClick={() => navigate('/dashboard')} label="Voltar para o início" />
      </div>

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

        {/* Pix button — abre o fluxo de envio */}
        <Button
          type="button"
          onClick={onPixClick}
          className="rounded-xl px-5 h-9 text-sm font-semibold"
        >
          Pix
        </Button>
      </div>
    </div>
  );
}
