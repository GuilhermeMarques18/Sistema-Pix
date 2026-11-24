'use client';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/app/core/auth/SessionProvider';
import { useSendPix } from '../hooks/useSendPix';
import { StepInserirChave } from './StepInserirChave';
import { StepConfirmarConta } from './StepConfirmarConta';
import { StepInserirValor } from './StepInserirValor';
import { StepConfirmarValor } from './StepConfirmarValor';
import { StepConfirmarDados } from './StepConfirmarDados';
import { StepDigitarSenha } from './StepDigitarSenha';
import { StepSucesso } from './StepSucesso';

interface SendPixFlowProps {
  onClose: () => void;
  onCompleted: () => Promise<unknown>;
}
export function SendPixFlow({ onClose, onCompleted }: SendPixFlowProps) {
  const navigate = useNavigate();
  const { reload } = useSession();
  const flow = useSendPix(async () => { await Promise.all([reload(), onCompleted()]); });
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);

  useEffect(() => { dialog.current?.querySelector<HTMLElement>('input, select, button')?.focus(); }, [flow.step]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !flow.isLoading) onClose();
      if (event.key !== 'Tab') return;
      const nodes = dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href]');
      if (!nodes?.length) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flow.isLoading, onClose]);

  const progress = Math.max(0, ['inserir-chave', 'confirmar-conta', 'inserir-valor', 'confirmar-valor', 'confirmar-dados', 'digitar-senha'].indexOf(flow.step)) + 1;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-bg md:bg-black/60" role="dialog" aria-modal="true" aria-label="Enviar Pix" ref={dialog}>
      <div className="flex h-full w-full max-w-md flex-col overflow-hidden bg-bg md:h-[85vh] md:rounded-2xl md:shadow-2xl">
        {flow.step !== 'sucesso' && <div className="h-1 shrink-0 bg-bg-input" aria-hidden="true"><div className="h-1 bg-brand-element" style={{ width: `${progress / 6 * 100}%` }} /></div>}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {flow.step === 'inserir-chave' && <StepInserirChave onConfirm={flow.submitKey} onClose={onClose} isLoading={flow.isLoading} error={flow.error} />}
          {flow.step === 'confirmar-conta' && <StepConfirmarConta flowData={flow.flowData} onConfirm={flow.confirmAccount} onBack={flow.goBack} />}
          {flow.step === 'inserir-valor' && <StepInserirValor flowData={flow.flowData} onConfirm={flow.submitValor} onBack={flow.goBack} error={flow.error} />}
          {flow.step === 'confirmar-valor' && <StepConfirmarValor flowData={flow.flowData} onConfirm={flow.confirmValor} onBack={flow.goBack} />}
          {flow.step === 'confirmar-dados' && <StepConfirmarDados flowData={flow.flowData} onConfirm={flow.confirmDados} onBack={flow.goBack} />}
          {flow.step === 'digitar-senha' && <StepDigitarSenha onConfirm={flow.submitSenha} onBack={flow.goBack} onClose={onClose} isLoading={flow.isLoading} outcomeUnknown={flow.outcomeUnknown} error={flow.error} />}
          {flow.step === 'sucesso' && flow.receipt && <StepSucesso receipt={flow.receipt} isLoading={flow.isLoading} refreshError={flow.refreshError}
            onVoltar={() => { onClose(); navigate('/extrato'); }} onFazerNovoPix={() => { void flow.reset(); }} />}
        </div>
      </div>
    </div>
  );
}
