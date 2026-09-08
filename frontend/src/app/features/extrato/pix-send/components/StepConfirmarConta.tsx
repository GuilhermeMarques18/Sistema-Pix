'use client';

import { Button } from '@/app/shared/components/ui/button';
import { BackButton } from '@/app/shared/components/ui';
import type { SendPixFlowData } from '../types/pix-send.types';

interface StepConfirmarContaProps {
  flowData: SendPixFlowData;
  onConfirm: () => void;
  onBack: () => void;
}

interface DataFieldProps {
  label: string;
  value: string;
  large?: boolean;
}

function DataField({ label, value, large = false }: DataFieldProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-text-secondary">{label}</span>
      {large ? (
        <span className="text-xl font-bold text-text leading-snug">{value}</span>
      ) : (
        <span className="text-sm font-semibold text-text">{value}</span>
      )}
    </div>
  );
}

export function StepConfirmarConta({
  flowData,
  onConfirm,
  onBack,
}: StepConfirmarContaProps) {
  return (
    <div className="flex flex-col h-full bg-bg">
      {/* ── Header ── */}
      <div className="px-4 pt-6 pb-2">
        {/* Botão voltar */}
        <BackButton onClick={onBack} />

        {/* Título */}
        <h1 className="text-title font-bold text-text leading-tight mt-5">Confira a conta</h1>
        <p className="text-sm text-text-secondary mt-1">
          Confirme os dados de quem vai receber
        </p>
      </div>

      {/* ── Dados do destinatário ── */}
      <div className="flex flex-col flex-1 px-4 pt-6 gap-5">
        {/* Nome */}
        <DataField label="Nome" value={flowData.recipientName} large />

        {/* Chave PIX */}
        <DataField label="Chave PIX" value={flowData.chavePix} />

        {/* CPF */}
        <DataField label="CPF" value={flowData.recipientCpf} />

        {/* Agência */}
        <DataField label="Agência" value={flowData.recipientAgencia} />

        {/* Conta */}
        <DataField label="Conta" value={flowData.recipientAccount} />
      </div>

      {/* ── Botão ── */}
      <div className="px-4 pb-8 pt-6">
        <Button
          type="button"
          onClick={onConfirm}
          className="w-full h-13 rounded-xl text-base font-semibold"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
