'use client';
import { CheckCircle } from '@phosphor-icons/react';
import { Button } from '@/app/shared/components/ui/button';
import type { PixTransactionResponse } from '@/app/shared/types/api.types';

interface Props {
  receipt: PixTransactionResponse;
  onVoltar: () => void;
  onFazerNovoPix: () => void;
  isLoading: boolean;
  refreshError: string | null;
}
export function StepSucesso({ receipt, onVoltar, onFazerNovoPix, isLoading, refreshError }: Props) {
  const amount = receipt.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const fields = [
    ['ID da transação', receipt.idTransacao],
    ['Data e hora', new Date(receipt.dataHora).toLocaleString('pt-BR')],
    ['Destinatário', receipt.nomeDestinatario],
    ['CPF/CNPJ', receipt.documentoDestinatarioMascarado],
    ['Chave Pix', receipt.chavePix],
    ['ID da conta de destino', receipt.contaDestinoId],
    ['Descrição', receipt.descricao],
  ];
  return (
    <div className="flex min-h-full flex-col gap-5 p-4">
      <CheckCircle size={64} weight="fill" className="mx-auto mt-4 text-brand-element" aria-hidden="true" />
      <h2 className="text-center text-lg font-bold text-text">Pix de {amount} confirmado</h2>
      <dl className="space-y-3 rounded-xl bg-bg-input p-4">
        {fields.map(([label, value]) => value && <div key={label}><dt className="text-xs text-text-secondary">{label}</dt><dd className="break-all text-sm text-text">{value}</dd></div>)}
      </dl>
      {refreshError && <p role="alert" className="text-sm text-text-negative">{refreshError}</p>}
      <div className="mt-auto flex flex-col gap-3 pb-4">
        <Button onClick={onVoltar} disabled={isLoading}>Ir para extrato</Button>
        <Button variant="outline" onClick={onFazerNovoPix} disabled={isLoading}>Fazer novo Pix</Button>
      </div>
    </div>
  );
}
