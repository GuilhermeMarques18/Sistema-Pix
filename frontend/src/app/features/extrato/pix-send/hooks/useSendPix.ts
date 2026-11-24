'use client';

import { useCallback, useRef, useState } from 'react';
import axios from 'axios';
import { useSession } from '@/app/core/auth/SessionProvider';
import { userService } from '@/app/shared/services/user.service';
import { getApiErrorMessage } from '@/app/shared/lib/apiError';
import { normalizePixKey } from '@/app/shared/lib/pixKey';
import type { AccountSummary, PixKeyType, PixTransactionResponse } from '@/app/shared/types/api.types';
import { pixSendService } from '../services/pix-send.service';
import { readPendingPix, savePendingPix, clearPendingPix } from '../lib/pendingPix';
import { centsToDecimal, moneyToCents } from '../lib/money';
import type { SendPixFlowData, SendPixStep } from '../types/pix-send.types';

const steps: SendPixStep[] = ['inserir-chave', 'confirmar-conta', 'inserir-valor', 'confirmar-valor', 'confirmar-dados', 'digitar-senha', 'sucesso'];
function initialData(account: AccountSummary | null): SendPixFlowData {
  return {
    chavePix: '', keyType: null, contaDestinoId: '', recipientName: '', recipientDocument: null,
    valor: 0, descricao: '', availableBalance: account?.availableBalance ?? 0,
    blockedBalance: account?.blockedBalance ?? 0, pixLimit: account?.pixLimit ?? 0,
    accountStatus: account?.status ?? 'BLOQUEADA',
  };
}

export function useSendPix(onSuccess?: () => Promise<unknown>) {
  const { account } = useSession();
  const [pending] = useState(() => account ? readPendingPix(account.id) : null);
  const [step, setStep] = useState<SendPixStep>(pending ? 'digitar-senha' : 'inserir-chave');
  const [flowData, setFlowData] = useState<SendPixFlowData>(pending?.flowData ?? initialData(account));
  const [receipt, setReceipt] = useState<PixTransactionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [outcomeUnknown, setOutcomeUnknown] = useState(!!pending);
  const [error, setError] = useState<string | null>(pending ? 'Há um envio pendente nesta aba. Confirme sua senha para consultar ou concluir o mesmo pedido.' : null);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const requestId = useRef(pending?.requestId ?? crypto.randomUUID());
  const busy = useRef(false);

  const submitKey = async (key: string, type: PixKeyType) => {
    if (busy.current || outcomeUnknown || !account) return;
    busy.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const source = await userService.getMyAccount();
      if (source.id !== account.id) throw new Error('A sessão da conta mudou. Abra o envio novamente.');
      if (source.status === 'BLOQUEADA') throw new Error('Sua conta está bloqueada. Acesse os ajustes da conta.');
      const canonicalKey = normalizePixKey(type, key);
      const recipient = await pixSendService.resolveRecipient(type, canonicalKey);
      if (recipient.contaDestinoId === source.id) throw new Error('Não é possível enviar Pix para sua própria conta.');
      requestId.current = crypto.randomUUID();
      setFlowData({
        ...initialData(source), chavePix: recipient.chave, keyType: recipient.tipo,
        contaDestinoId: recipient.contaDestinoId, recipientName: recipient.nome, recipientDocument: recipient.documentoMascarado,
      });
      setStep('confirmar-conta');
    } catch (err) {
      setError(err instanceof Error && !axios.isAxiosError(err) ? err.message : getApiErrorMessage(err));
    } finally {
      busy.current = false;
      setIsLoading(false);
    }
  };

  const submitValor = (value: number, description: string) => {
    if (busy.current || outcomeUnknown || receipt) return;
    const cents = moneyToCents(value);
    if (!Number.isFinite(value) || !Number.isSafeInteger(cents) || cents <= 0 || Math.abs(value * 100 - cents) > 0.001) {
      setError('Informe um valor positivo com até duas casas decimais.'); return;
    }
    if (cents > moneyToCents(flowData.availableBalance)) { setError('Saldo disponível insuficiente. Valores retidos não podem ser enviados.'); return; }
    if (flowData.pixLimit > 0 && cents > moneyToCents(flowData.pixLimit)) { setError('O valor excede seu limite por Pix.'); return; }
    if (description.trim().length > 100) { setError('Use no máximo 100 caracteres na descrição.'); return; }
    requestId.current = crypto.randomUUID();
    setFlowData((current) => ({ ...current, valor: value, descricao: description.trim() }));
    setError(null);
    setStep('confirmar-valor');
  };

  const submitSenha = async (password: string) => {
    if (busy.current || !account || !flowData.keyType || !flowData.contaDestinoId) return;
    if (!password || password.length < 6) { setError('Informe sua senha de acesso.'); return; }
    // Guardar somente dados necessários ao replay, nunca a senha.
    if (!savePendingPix({ version: 1, sourceAccountId: account.id, requestId: requestId.current, flowData })) {
      setError('Não foi possível preparar a recuperação do envio. Habilite o armazenamento desta aba e tente novamente.');
      return;
    }
    busy.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const result = await pixSendService.sendPix({
        chavePix: flowData.chavePix, tipoChave: flowData.keyType, contaDestinoId: flowData.contaDestinoId,
        valor: centsToDecimal(moneyToCents(flowData.valor)), descricao: flowData.descricao || null,
        password, idempotencyKey: requestId.current,
      });
      clearPendingPix(account.id);
      setOutcomeUnknown(false);
      setReceipt(result);
      setStep('sucesso');
      // Uma falha na atualização de tela não deve transformar Pix confirmado em falha de envio.
      if (onSuccess) {
        try { await onSuccess(); } catch { setRefreshError('Pix confirmado. Não foi possível atualizar a conta; tente novamente antes de um novo envio.'); }
      }
    } catch (err) {
      const uncertain = !axios.isAxiosError(err) || !err.response || err.response.status >= 500;
      setOutcomeUnknown(uncertain);
      if (uncertain) {
        setError('O resultado do envio ainda não foi confirmado. Digite a senha e tente novamente para consultar ou concluir o mesmo pedido, sem duplicar o débito.');
      } else {
        clearPendingPix(account.id);
        setError(getApiErrorMessage(err, 'Não foi possível realizar a transferência.'));
      }
    } finally {
      busy.current = false;
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (busy.current || outcomeUnknown) return;
    setStep((current) => steps[Math.max(0, steps.indexOf(current) - 1)]);
    setError(null);
  };

  const reset = async () => {
    if (busy.current || outcomeUnknown || !account) return;
    busy.current = true;
    setIsLoading(true);
    setRefreshError(null);
    try {
      const freshAccount = await userService.getMyAccount();
      setFlowData(initialData(freshAccount));
      requestId.current = crypto.randomUUID();
      setReceipt(null);
      setError(null);
      setStep('inserir-chave');
    } catch (err) { setRefreshError(getApiErrorMessage(err)); }
    finally { busy.current = false; setIsLoading(false); }
  };

  const confirmAccount = useCallback(() => { setError(null); setStep('inserir-valor'); }, []);
  const confirmValor = useCallback(() => setStep('confirmar-dados'), []);
  const confirmDados = useCallback(() => setStep('digitar-senha'), []);
  return {
    step, flowData, receipt, isLoading, outcomeUnknown, error, refreshError,
    submitKey, submitValor, submitSenha, confirmAccount, confirmValor, confirmDados, goBack, reset,
  };
}
