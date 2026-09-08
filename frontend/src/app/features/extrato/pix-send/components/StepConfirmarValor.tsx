'use client';

import { Button } from '@/app/shared/components/ui/button';
import { BackButton } from '@/app/shared/components/ui';
import type { SendPixFlowData } from '../types/pix-send.types';

interface StepConfirmarValorProps {
  flowData: SendPixFlowData;
  onConfirm: () => void;
  onBack: () => void;
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function StepConfirmarValor({
  flowData,
  onConfirm,
  onBack,
}: StepConfirmarValorProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <BackButton onClick={onBack} />
        <div className="mt-5">
          <h2 className="text-base font-semibold text-text">Inserir valor</h2>
          <p className="text-xs text-text-secondary mt-0.5">{flowData.recipientName}</p>
        </div>
      </div>

      <div className="flex flex-col flex-1 px-4 gap-4">
        {/* Valor card */}
        <div className="rounded-xl bg-bg-input p-4 flex flex-col gap-1">
          <span className="text-xs text-text-secondary">Valor</span>
          <span className="text-title font-bold text-text">{formatBRL(flowData.valor)}</span>
          <span className="text-xs text-text-secondary">
            Saldo Disponível:{' '}
            <span className="text-text-tertiary">{formatBRL(flowData.availableBalance)}</span>
          </span>
        </div>

        {/* Descrição se existir */}
        {flowData.descricao && (
          <div className="rounded-xl bg-bg-input p-4">
            <span className="text-xs text-text-secondary">Descrição</span>
            <p className="text-sm text-text mt-1">{flowData.descricao}</p>
          </div>
        )}
      </div>

      <div className="px-4 pb-6 pt-4">
        <Button
          type="button"
          onClick={onConfirm}
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
