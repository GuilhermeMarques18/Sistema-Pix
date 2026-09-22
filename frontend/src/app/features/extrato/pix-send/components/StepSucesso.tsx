'use client';

import { CheckCircle } from '@phosphor-icons/react';
import { Button } from '@/app/shared/components/ui/button';
import type { SendPixFlowData } from '../types/pix-send.types';

interface StepSucessoProps {
  flowData: SendPixFlowData;
  onVoltar: () => void;
  onFazerNovoPix: () => void;
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function StepSucesso({
  flowData,
  onVoltar,
  onFazerNovoPix,
}: StepSucessoProps) {
  return (
    <div className="flex flex-col h-full px-4">
      {/* Ícone de sucesso */}
      <div className="flex flex-col items-center justify-center flex-1 gap-4">
        <CheckCircle
          size={72}
          weight="fill"
          className="text-brand-element"
          aria-hidden="true"
        />

        <div className="text-center">
          <h2 className="text-base font-bold text-text mb-1">
            Você fez um PIX de {formatBRL(flowData.valor)}
          </h2>
          <p className="text-sm text-text-secondary">{flowData.recipientName}</p>
        </div>

        {/* Resumo */}
        <div className="w-full rounded-xl bg-bg-input p-4 flex flex-col gap-2 mt-2">
          <InfoLine label={flowData.chavePix} value="" highlight />
          <div className="h-px bg-border" />
          <InfoLine label="Valor" value={`+${formatBRL(flowData.valor)}`} />
          <InfoLine label="Agência" value={flowData.recipientAgencia} />
          <InfoLine label="Conta" value={flowData.recipientAccount} />
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-col gap-3 pb-6">
        <Button
          type="button"
          onClick={onVoltar}
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          Ir para extrato
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onFazerNovoPix}
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          Fazer novo pix
        </Button>
      </div>
    </div>
  );
}

interface InfoLineProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function InfoLine({ label, value, highlight = false }: InfoLineProps) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-xs ${highlight ? 'text-text-tertiary' : 'text-text-secondary'}`}>
        {label}
      </span>
      {value && <span className="text-xs text-text">{value}</span>}
    </div>
  );
}
