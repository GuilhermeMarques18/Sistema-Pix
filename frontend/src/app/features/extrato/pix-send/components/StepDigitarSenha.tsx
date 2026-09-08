'use client';

import { useState, useRef, useEffect } from 'react';
import { Backspace } from '@phosphor-icons/react';
import { Button } from '@/app/shared/components/ui/button';
import { BackButton } from '@/app/shared/components/ui';

interface StepDigitarSenhaProps {
  onConfirm: (senha: string) => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
}

const PIN_LENGTH = 4;

const NUMPAD_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
];

export function StepDigitarSenha({
  onConfirm,
  onBack,
  isLoading,
  error,
}: StepDigitarSenhaProps) {
  const [pin, setPin] = useState('');
  const submitted = useRef(false);

  // Auto-submit quando PIN completo
  useEffect(() => {
    if (pin.length === PIN_LENGTH && !submitted.current) {
      submitted.current = true;
      onConfirm(pin);
    }
  }, [pin, onConfirm]);

  // Reset se houver erro (para deixar tentar de novo)
  useEffect(() => {
    if (error) {
      setPin('');
      submitted.current = false;
    }
  }, [error]);

  function handleKey(key: string) {
    if (isLoading) return;

    if (key === 'del') {
      setPin((prev) => prev.slice(0, -1));
      submitted.current = false;
      return;
    }

    if (pin.length < PIN_LENGTH) {
      setPin((prev) => prev + key);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <BackButton onClick={onBack} label="Voltar" />
        <div className="mt-5">
          <h2 className="text-base font-semibold text-text">Digite sua senha</h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Insira sua senha de 4 dígitos para confirmar
          </p>
        </div>
      </div>

      <div className="flex flex-col flex-1 px-4">
        {/* Dots */}
        <div
          className="flex justify-center gap-5 mt-6 mb-6"
          role="group"
          aria-label="Dígitos da senha"
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              aria-label={`Dígito ${i + 1} ${i < pin.length ? 'preenchido' : 'vazio'}`}
              className={`h-4 w-4 rounded-full border-2 transition-colors duration-150 ${
                i < pin.length
                  ? 'bg-brand-element border-brand-element'
                  : 'bg-transparent border-text-secondary'
              }`}
            />
          ))}
        </div>

        {/* Erro */}
        {error && (
          <p className="text-xs text-text-negative text-center mb-4">{error}</p>
        )}

        {isLoading && (
          <p className="text-xs text-text-secondary text-center mb-4">Processando...</p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 mt-auto">
          {NUMPAD_KEYS.flat().map((key, idx) => {
            if (key === '') {
              return <div key={`empty-${idx}`} />;
            }

            if (key === 'del') {
              return (
                <button
                  key="del"
                  type="button"
                  onClick={() => handleKey('del')}
                  disabled={isLoading || pin.length === 0}
                  aria-label="Apagar dígito"
                  className="flex h-14 w-full items-center justify-center rounded-xl bg-bg-input
                    text-text transition-all active:scale-95 hover:bg-bg-input-hover
                    disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2
                    focus-visible:ring-brand-logo"
                >
                  <Backspace size={22} weight="regular" />
                </button>
              );
            }

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleKey(key)}
                disabled={isLoading || pin.length >= PIN_LENGTH}
                aria-label={`Dígito ${key}`}
                className="flex h-14 w-full flex-col items-center justify-center rounded-xl bg-bg-input
                  transition-all active:scale-95 hover:bg-bg-input-hover
                  disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-brand-logo"
              >
                <span className="text-base font-semibold text-text leading-none">{key}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit explícito caso auto-submit não dispare */}
      <div className="px-4 pb-6 pt-4">
        <Button
          type="button"
          onClick={() => pin.length === PIN_LENGTH && onConfirm(pin)}
          disabled={isLoading || pin.length < PIN_LENGTH}
          className="w-full h-12 rounded-xl text-base font-semibold"
        >
          {isLoading ? 'Enviando...' : 'Enviar PIX'}
        </Button>
      </div>
    </div>
  );
}
