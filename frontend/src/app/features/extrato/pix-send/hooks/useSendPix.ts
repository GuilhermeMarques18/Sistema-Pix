'use client';

import { useState, useCallback } from 'react';
import { pixSendService } from '../services/pix-send.service';
import type { SendPixFlowData, SendPixStep } from '../types/pix-send.types';

const INITIAL_FLOW_DATA: SendPixFlowData = {
  chavePix: '',
  keyType: null,
  contaDestinoId: '',
  recipientName: '',
  recipientAccount: '',
  recipientCpf: '',
  recipientAgencia: '',
  valor: 0,
  descricao: '',
  availableBalance: 0,
  pixLimit: 0,
};

interface UseSendPixReturn {
  step: SendPixStep;
  flowData: SendPixFlowData;
  isLoading: boolean;
  error: string | null;
  transactionId: string | null;
  submitKey: (chavePix: string, availableBalance: number, pixLimit: number) => Promise<void>;
  confirmAccount: () => void;
  submitValor: (valor: number, descricao: string) => void;
  confirmValor: () => void;
  confirmDados: () => void;
  submitSenha: (senha: string) => Promise<void>;
  goBack: () => void;
  reset: () => void;
}

const STEP_ORDER: SendPixStep[] = [
  'inserir-chave',
  'confirmar-conta',
  'inserir-valor',
  'confirmar-valor',
  'confirmar-dados',
  'digitar-senha',
  'sucesso',
];

export function useSendPix(): UseSendPixReturn {
  const [step, setStep] = useState<SendPixStep>('inserir-chave');
  const [flowData, setFlowData] = useState<SendPixFlowData>(INITIAL_FLOW_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const goBack = useCallback(() => {
    const currentIndex = STEP_ORDER.indexOf(step);
    if (currentIndex > 0) {
      setStep(STEP_ORDER[currentIndex - 1]);
      setError(null);
    }
  }, [step]);

  const reset = useCallback(() => {
    setStep('inserir-chave');
    setFlowData(INITIAL_FLOW_DATA);
    setError(null);
    setIsLoading(false);
    setTransactionId(null);
  }, []);

  // Step 1 → Step 2: valida chave e busca conta destino
  const submitKey = useCallback(
    async (chavePix: string, availableBalance: number, pixLimit: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const validation = await pixSendService.validateKey(chavePix);

        if (!validation.valida) {
          setError('Chave Pix inválida. Verifique e tente novamente.');
          return;
        }
        if (!validation.cadastrada) {
          setError('Chave Pix não encontrada. Verifique o destinatário.');
          return;
        }

        const account = await pixSendService.getAccountById(validation.contaDestinoId);

        setFlowData((prev) => ({
          ...prev,
          chavePix,
          keyType: validation.tipo,
          contaDestinoId: validation.contaDestinoId,
          recipientName: account.ownerName,
          recipientAccount: validation.contaDestinoId.slice(0, 8).toUpperCase(),
          recipientCpf: chavePix,
          recipientAgencia: '0001',
          availableBalance,
          pixLimit,
        }));

        setStep('confirmar-conta');
      } catch {
        setError('Não foi possível validar a chave Pix. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Step 2 → Step 3
  const confirmAccount = useCallback(() => {
    setStep('inserir-valor');
  }, []);

  // Step 3 → Step 4
  const submitValor = useCallback((valor: number, descricao: string) => {
    setFlowData((prev) => ({ ...prev, valor, descricao }));
    setStep('confirmar-valor');
  }, []);

  // Step 4 → Step 5
  const confirmValor = useCallback(() => {
    setStep('confirmar-dados');
  }, []);

  // Step 5 → Step 6
  const confirmDados = useCallback(() => {
    setStep('digitar-senha');
  }, []);

  // Step 6 → Step 7: envia o Pix (senha é validada localmente; em prod seria verificada no backend)
  const submitSenha = useCallback(
    async (_senha: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await pixSendService.sendPix({
          chavePix: flowData.chavePix,
          valor: flowData.valor,
          descricao: flowData.descricao || undefined,
        });
        setTransactionId(result.idTransacao);
        setStep('sucesso');
      } catch {
        setError('Não foi possível realizar a transferência. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    },
    [flowData],
  );

  return {
    step,
    flowData,
    isLoading,
    error,
    transactionId,
    submitKey,
    confirmAccount,
    submitValor,
    confirmValor,
    confirmDados,
    submitSenha,
    goBack,
    reset,
  };
}
