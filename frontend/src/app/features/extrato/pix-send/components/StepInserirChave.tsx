'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, ArrowRight } from '@phosphor-icons/react';
import { BackButton } from '@/app/shared/components/ui';
import {
  inserirChaveSchema,
  type InserirChaveFormValues,
} from '../schemas/pix-send.schema';

interface StepInserirChaveProps {
  /** Chamada ao backend para validar a chave — só ocorre no submit */
  onConfirm: (chavePix: string) => void;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
}

export function StepInserirChave({
  onConfirm,
  onClose,
  isLoading,
  error,
}: StepInserirChaveProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<InserirChaveFormValues>({
    resolver: zodResolver(inserirChaveSchema),
    defaultValues: { chavePix: '' },
  });

  // useWatch só controla visibilidade local do card e do ícone — sem chamar API
  const chavePix = useWatch({ control, name: 'chavePix', defaultValue: '' });
  const hasValue = chavePix.trim().length > 0;

  function onSubmit(values: InserirChaveFormValues) {
    // Aqui sim chama o backend (via prop onConfirm → useSendPix.submitKey)
    onConfirm(values.chavePix.trim());
  }

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* ── Header ── */}
      <div className="px-4 pt-6 pb-2">
        <BackButton onClick={onClose} label="Fechar envio de PIX" />
        <h1 className="text-title font-bold text-text leading-tight mt-5">Enviar PIX</h1>
        <p className="text-sm text-text-secondary mt-1">
          Preencha os dados para realizar a transferência
        </p>
      </div>

      {/* ── Form ── */}
      <form
        id="form-inserir-chave"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col flex-1 px-4 pt-5"
      >
        {/* Label negrito */}
        <p className="text-sm font-bold text-text mb-3">Chave PIX do destinatário</p>

        {/* Input com underline */}
        <div className="relative mb-1">
          <input
            id="chavePix"
            type="text"
            placeholder="CPF, e-mail, celular ou chave aleatória"
            autoComplete="off"
            autoFocus
            disabled={isLoading}
            {...register('chavePix')}
            className="w-full bg-transparent border-0 border-b-2 border-text-secondary
              text-sm text-text placeholder:text-text-secondary
              focus:outline-none focus:border-brand-element
              pb-2 pr-8 transition-colors disabled:opacity-60"
          />
          {/* Ícone check — aparece quando há texto, sem nenhuma validação ainda */}
          {hasValue && !isLoading && (
            <span className="absolute right-0 top-0 text-brand-element pointer-events-none">
              <CheckCircle size={22} weight="fill" />
            </span>
          )}
        </div>

        {/* Erro de schema (campo vazio) */}
        {errors.chavePix && (
          <p className="mt-1.5 text-xs text-text-negative">{errors.chavePix.message}</p>
        )}

        {/* Erro retornado pelo backend (chave inválida / não cadastrada) */}
        {error && (
          <p className="mt-1.5 text-xs text-text-negative">{error}</p>
        )}

        {/*
         * Card "Fazer PIX para" — aparece quando há texto no campo.
         * Ao clicar, submete o form → chama o backend via onConfirm.
         * Não há nenhuma validação ou chamada de API antes disso.
         */}
        {hasValue && (
          <button
            type="submit"
            form="form-inserir-chave"
            disabled={isLoading}
            className="mt-4 flex items-center justify-between rounded-xl bg-bg-input px-4 py-3.5
              text-left transition-colors hover:bg-bg-input-hover active:scale-95
              disabled:opacity-60
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-logo"
          >
            <div>
              <p className="text-xs text-text-secondary mb-0.5">Fazer PIX para:</p>
              <p className="text-sm text-text font-medium">{chavePix.trim()}</p>
            </div>
            {isLoading ? (
              <span className="text-xs text-text-secondary animate-pulse">Validando...</span>
            ) : (
              <ArrowRight size={18} weight="bold" className="text-text-secondary shrink-0" />
            )}
          </button>
        )}

        <div className="flex-1" />
      </form>
    </div>
  );
}
