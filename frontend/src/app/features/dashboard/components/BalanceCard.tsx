'use client';

import { useState } from 'react';
import { Eye, EyeSlash } from '@phosphor-icons/react';

interface BalanceCardProps {
  balance: number;
  used: number;
  limit: number;
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function BalanceCard({ balance, used, limit }: BalanceCardProps) {
  const [visible, setVisible] = useState(true);
  const usedPercent = Math.min((used / limit) * 100, 100);

  return (
    <div className="px-4 pt-4 pb-2">
      <p className="text-xs text-text-secondary mb-1">Saldo atual</p>

      {/* Balance row */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-title font-bold text-text">
          {visible ? formatBRL(balance) : 'R$ ••••••'}
        </span>
        <button
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar saldo' : 'Mostrar saldo'}
          className="text-text-secondary hover:text-text transition-colors"
        >
          {visible ? (
            <EyeSlash size={20} weight="regular" />
          ) : (
            <Eye size={20} weight="regular" />
          )}
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-bg-input overflow-hidden mb-1.5">
        <div
          className="h-full rounded-full bg-brand-element transition-all duration-500"
          style={{ width: `${usedPercent}%` }}
        />
      </div>

      {/* Used / Limit */}
      <div className="flex justify-between">
        <span className="text-xs text-text-secondary">
          Usado {formatBRL(used)}
        </span>
        <span className="text-xs text-text-secondary">
          Limite: {formatBRL(limit)}
        </span>
      </div>
    </div>
  );
}
