'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/app/shared/components/ui/button';
import { Input } from '@/app/shared/components/ui/input';
import { Label } from '@/app/shared/components/ui/label';
import { BackButton } from '@/app/shared/components/ui';
import {
  inserirValorSchema,
  type InserirValorFormValues,
} from '../schemas/pix-send.schema';
import type { SendPixFlowData } from '../types/pix-send.types';

interface StepInserirValorProps {
  flowData: SendPixFlowData;
  onConfirm: (valor: number, descricao: string) => void;
  onBack: () => void;
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function StepInserirValor({
  flowData,
  onConfirm,
  onBack,
}: StepInserirValorProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InserirValorFormValues>({
    resolver: zodResolver(inserirValorSchema),
    defaultValues: {
      valor: flowData.valor > 0 ? String(flowData.valor) : '',
      descricao: flowData.descricao,
    },
  });

  function onSubmit(values: InserirValorFormValues) {
    const valorNumerico = parseFloat(values.valor.replace(',', '.'));
    onConfirm(valorNumerico, values.descricao ?? '');
  }

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

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 px-4">
        {/* Saldo disponível */}
        <div className="rounded-xl bg-bg-input p-4 mb-4 flex flex-col gap-1">
          <span className="text-xs text-text-secondary">Valor</span>
          <span className="text-title font-bold text-text">
            {flowData.valor > 0 ? formatBRL(flowData.valor) : 'R$ 0,00'}
          </span>
          <span className="text-xs text-text-secondary">
            Saldo Disponível:{' '}
            <span className="text-text-tertiary">{formatBRL(flowData.availableBalance)}</span>
          </span>
        </div>

        {/* Campo valor */}
        <div className="mb-3">
          <Label htmlFor="valor" className="mb-1.5 block">
            Valor (R$)
          </Label>
          <Input
            id="valor"
            placeholder="0,00"
            inputMode="decimal"
            autoFocus
            {...register('valor')}
          />
          {errors.valor && (
            <p className="mt-1 text-xs text-text-negative">{errors.valor.message}</p>
          )}
        </div>

        {/* Campo descrição */}
        <div className="mb-3">
          <Label htmlFor="descricao" className="mb-1.5 block">
            Descrição (opcional)
          </Label>
          <Input
            id="descricao"
            placeholder="Ex: Pagamento de serviço"
            {...register('descricao')}
          />
        </div>

        <div className="flex-1" />

        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-base font-semibold mb-6"
        >
          Continuar
        </Button>
      </form>
    </div>
  );
}
