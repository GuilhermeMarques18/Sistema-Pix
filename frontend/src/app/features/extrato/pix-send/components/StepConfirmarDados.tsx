'use client';

import { Button } from '@/app/shared/components/ui/button';
import { BackButton } from '@/app/shared/components/ui';
import type { SendPixFlowData } from '../types/pix-send.types';

interface StepConfirmarDadosProps {
  flowData: SendPixFlowData;
  onConfirm: () => void;
  onBack: () => void;
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className="text-sm text-text">{value}</span>
    </div>
  );
}

export function StepConfirmarDados({
  flowData,
  onConfirm,
  onBack,
}: StepConfirmarDadosProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <BackButton onClick={onBack} />
        <h2 className="text-base font-semibold text-text mt-5">Confira os dados</h2>
      </div>

      <div className="flex flex-col flex-1 px-4 gap-4 overflow-y-auto">
        {/* Valor */}
        <div className="rounded-xl bg-bg-input p-4 flex flex-col gap-1">
          <span className="text-xs text-text-secondary">Valor</span>
          <span className="text-title font-bold text-text">{formatBRL(flowData.valor)}</span>
        </div>

        {/* Dados do destinatário */}
        <div className="rounded-xl bg-bg-input p-4 flex flex-col gap-3">
          <p className="text-base font-semibold text-text">{flowData.recipientName}</p>
          <div className="h-px bg-border" />
          <InfoRow label="Chave PIX" value={flowData.chavePix} />
          <InfoRow label="CPF" value={flowData.recipientCpf} />
          <InfoRow label="Agência" value={flowData.recipientAgencia} />
          <InfoRow label="Conta" value={flowData.recipientAccount} />
        </div>

        {flowData.descricao && (
          <div className="rounded-xl bg-bg-input p-4">
            <InfoRow label="Descrição" value={flowData.descricao} />
          </div>
        )}
      </div>

      {/* Aviso + botão */}
      <div className="px-4 pb-6 pt-4">
        <p className="text-xs text-text-secondary text-center mb-4">
          Confira os dados antes de enviar
        </p>
        <Button
          type="button"
          onClick={onConfirm}
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          Confirmar
        </Button>
      </div>
    </div>
  );
}
