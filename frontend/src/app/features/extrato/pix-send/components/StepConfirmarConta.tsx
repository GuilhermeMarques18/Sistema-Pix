'use client';
import { BackButton } from '@/app/shared/components/ui';
import { Button } from '@/app/shared/components/ui/button';
import type { SendPixFlowData } from '../types/pix-send.types';

export function StepConfirmarConta({ flowData, onConfirm, onBack }: { flowData: SendPixFlowData; onConfirm: () => void; onBack: () => void }) {
  return (
    <div className="flex h-full flex-col gap-5 p-4 pt-6">
      <BackButton onClick={onBack} />
      <h1 className="text-title font-bold text-text">Confira o destinatário</h1>
      <dl className="flex-1 space-y-4 text-text">
        <div><dt className="text-xs text-text-secondary">Nome</dt><dd className="font-semibold">{flowData.recipientName}</dd></div>
        {flowData.recipientDocument && <div><dt className="text-xs text-text-secondary">CPF/CNPJ</dt><dd>{flowData.recipientDocument}</dd></div>}
        <div><dt className="text-xs text-text-secondary">Chave Pix</dt><dd className="break-all">{flowData.chavePix}</dd></div>
        <div><dt className="text-xs text-text-secondary">ID da conta de destino</dt><dd className="break-all text-sm">{flowData.contaDestinoId}</dd></div>
      </dl>
      <Button className="mb-4 w-full" onClick={onConfirm}>Continuar</Button>
    </div>
  );
}
