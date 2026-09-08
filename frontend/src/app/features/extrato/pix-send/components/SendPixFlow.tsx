'use client';

import { useEffect } from 'react';
import { useSendPix } from '../hooks/useSendPix';
import { StepInserirChave } from './StepInserirChave';
import { StepConfirmarConta } from './StepConfirmarConta';
import { StepInserirValor } from './StepInserirValor';
import { StepConfirmarValor } from './StepConfirmarValor';
import { StepConfirmarDados } from './StepConfirmarDados';
import { StepDigitarSenha } from './StepDigitarSenha';
import { StepSucesso } from './StepSucesso';

interface SendPixFlowProps {
  /** Saldo disponível da conta do usuário logado */
  availableBalance: number;
  /** Limite Pix da conta do usuário logado */
  pixLimit: number;
  /** Fechar o fluxo e voltar ao extrato */
  onClose: () => void;
}

export function SendPixFlow({ availableBalance, pixLimit, onClose }: SendPixFlowProps) {
  const {
    step,
    flowData,
    isLoading,
    error,
    submitKey,
    confirmAccount,
    submitValor,
    confirmValor,
    confirmDados,
    submitSenha,
    goBack,
    reset,
  } = useSendPix();

  // Fecha o overlay com tecla Escape (apenas nas etapas iniciais)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && step === 'inserir-chave') {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, onClose]);

  function handleFazerNovoPix() {
    reset();
  }

  function handleVoltar() {
    reset();
    onClose();
  }

  return (
    /*
     * Overlay que cobre toda a tela incluindo a BottomNav.
     * z-[60] fica acima da BottomNav (z-50).
     */
    <div
      className="fixed inset-0 z-[60] flex justify-center bg-bg"
      role="dialog"
      aria-modal="true"
      aria-label="Enviar PIX"
    >
      <div className="w-full max-w-md flex flex-col overflow-hidden">
      {/* Progress indicator */}
      {step !== 'sucesso' && (
        <StepProgressBar step={step} />
      )}

      {/* Content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        {step === 'inserir-chave' && (
          <StepInserirChave
            onConfirm={(chave) => submitKey(chave, availableBalance, pixLimit)}
            onClose={onClose}
            isLoading={isLoading}
            error={error}
          />
        )}

        {step === 'confirmar-conta' && (
          <StepConfirmarConta
            flowData={flowData}
            onConfirm={confirmAccount}
            onBack={goBack}
          />
        )}

        {step === 'inserir-valor' && (
          <StepInserirValor
            flowData={flowData}
            onConfirm={submitValor}
            onBack={goBack}
          />
        )}

        {step === 'confirmar-valor' && (
          <StepConfirmarValor
            flowData={flowData}
            onConfirm={confirmValor}
            onBack={goBack}
          />
        )}

        {step === 'confirmar-dados' && (
          <StepConfirmarDados
            flowData={flowData}
            onConfirm={confirmDados}
            onBack={goBack}
          />
        )}

        {step === 'digitar-senha' && (
          <StepDigitarSenha
            onConfirm={submitSenha}
            onBack={goBack}
            isLoading={isLoading}
            error={error}
          />
        )}

        {step === 'sucesso' && (
          <StepSucesso
            flowData={flowData}
            onVoltar={handleVoltar}
            onFazerNovoPix={handleFazerNovoPix}
          />
        )}
      </div>
      </div>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

type NonSuccessStep = Exclude<
  ReturnType<typeof useSendPix>['step'],
  'sucesso'
>;

const STEP_LABELS: Record<NonSuccessStep, number> = {
  'inserir-chave': 1,
  'confirmar-conta': 2,
  'inserir-valor': 3,
  'confirmar-valor': 4,
  'confirmar-dados': 5,
  'digitar-senha': 6,
};

const TOTAL_STEPS = 6;

interface StepProgressBarProps {
  step: ReturnType<typeof useSendPix>['step'];
}

function StepProgressBar({ step }: StepProgressBarProps) {
  const current = step !== 'sucesso' ? STEP_LABELS[step as NonSuccessStep] : TOTAL_STEPS;
  const pct = Math.round((current / TOTAL_STEPS) * 100);

  return (
    <div className="w-full h-1 bg-bg-input shrink-0" aria-hidden="true">
      <div
        className="h-1 bg-brand-element transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
