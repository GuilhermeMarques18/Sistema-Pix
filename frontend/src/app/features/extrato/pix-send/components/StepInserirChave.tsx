'use client';

import { useRef } from 'react';
import { CheckCircle, ArrowRight } from '@phosphor-icons/react';
import { BackButton } from '@/app/shared/components/ui';
import { usePixKeyMask } from '../hooks/usePixKeyMask';

interface StepInserirChaveProps {
  /** Chamada ao backend para validar a chave — só ocorre no submit */
  onConfirm: (chavePix: string) => void;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
}

/** Label legível do tipo detectado — exibida abaixo do input */
const KEY_TYPE_LABEL: Record<string, string> = {
  cpf: 'CPF',
  cnpj: 'CNPJ',
  celular: 'Celular',
  email: 'E-mail',
  aleatorio: 'Chave aleatória',
};

export function StepInserirChave({
  onConfirm,
  onClose,
  isLoading,
  error,
}: StepInserirChaveProps) {
  const { displayValue, rawValue, keyType, handleChange } = usePixKeyMask();
  const formRef = useRef<HTMLFormElement>(null);

  const hasValue = displayValue.trim().length > 0;
  const typeLabel = KEY_TYPE_LABEL[keyType];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasValue || isLoading) return;
    // Envia o rawValue (sem máscara para CPF/CNPJ, com máscara para celular)
    onConfirm(rawValue.trim());
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
        ref={formRef}
        id="form-inserir-chave"
        onSubmit={handleSubmit}
        className="flex flex-col flex-1 px-4 pt-5"
      >
        {/* Label negrito */}
        <p className="text-sm font-bold text-text mb-3">Chave PIX do destinatário</p>

        {/* Input com underline */}
        <div className="relative mb-1">
          <input
            id="chavePix"
            type="text"
            inputMode={keyType === 'email' || keyType === 'aleatorio' ? 'text' : 'numeric'}
            placeholder="CPF, e-mail, celular ou chave aleatória"
            autoComplete="off"
            autoFocus
            disabled={isLoading}
            value={displayValue}
            onChange={handleChange}
            className="w-full bg-transparent border-0 border-b-2 border-text-secondary
              text-sm text-text placeholder:text-text-secondary
              focus:outline-none focus:border-brand-element
              pb-2 pr-8 transition-colors disabled:opacity-60"
          />
          {/* Check verde — aparece quando há texto */}
          {hasValue && !isLoading && (
            <span className="absolute right-0 top-0 text-brand-element pointer-events-none">
              <CheckCircle size={22} weight="fill" />
            </span>
          )}
        </div>

        {/* Tipo detectado — feedback visual abaixo do input */}
        {typeLabel && hasValue && (
          <p className="mt-1 text-xs text-text-secondary">
            Tipo detectado: <span className="text-text-tertiary font-medium">{typeLabel}</span>
          </p>
        )}

        {/* Erro retornado pelo backend */}
        {error && (
          <p className="mt-1.5 text-xs text-text-negative">{error}</p>
        )}

        {/*
         * Card "Fazer PIX para" — aparece quando há texto no campo.
         * Clicar submete o form → chama o backend via onConfirm.
         */}
        {hasValue && (
          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 flex items-center justify-between rounded-xl bg-bg-input px-4 py-3.5
              text-left transition-colors hover:bg-bg-input-hover active:scale-95
              disabled:opacity-60
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-logo"
          >
            <div>
              <p className="text-xs text-text-secondary mb-0.5">Fazer PIX para:</p>
              <p className="text-sm text-text font-medium">{displayValue.trim()}</p>
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
