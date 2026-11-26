'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle, ArrowRight, CircleNotch } from '@phosphor-icons/react';
import { BackButton } from '@/app/shared/components/ui';
import { getApiErrorMessage } from '@/app/shared/lib/apiError';
import { pixKeyLabels } from '@/app/shared/lib/pixKey';
import { pixContactsService, type PixContact } from '@/app/features/contacts/services/pixContacts.service';
import { usePixKeyMask } from '../hooks/usePixKeyMask';
import { pixSendService } from '../services/pix-send.service';
import type { PixKeyType } from '@/app/shared/types/api.types';

interface StepInserirChaveProps {
  onConfirm: (key: string, type: PixKeyType) => Promise<void>; // eslint-disable-line no-unused-vars
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
}

export function StepInserirChave({ onConfirm, onClose, isLoading, error }: StepInserirChaveProps) {
  const { displayValue, rawValue, keyType, typeLabel, handleChange, setKey } = usePixKeyMask();
  const [contacts, setContacts] = useState<PixContact[]>([]);
  const [contactsError, setContactsError] = useState<string | null>(null);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);
  const [validateError, setValidateError] = useState<string | null>(null);
  const lastValidated = useRef<string>('');

  useEffect(() => {
    let active = true;
    pixContactsService.listMine()
      .then((items) => { if (active) setContacts(items); })
      .catch((err: unknown) => { if (active) setContactsError(getApiErrorMessage(err, 'Não foi possível carregar seus contatos salvos.')); })
      .finally(() => { if (active) setLoadingContacts(false); });
    return () => { active = false; };
  }, []);

  const hasValue = displayValue.trim().length > 0;

  // Reseta o estado de validação quando o usuário muda a chave
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleChange(e);
    setValidated(false);
    setValidateError(null);
    lastValidated.current = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasValue || isLoading || !keyType) return;

    const key = rawValue.trim();

    // Se já validou essa chave, avança direto
    if (validated && lastValidated.current === key) {
      void onConfirm(key, keyType);
      return;
    }

    // Valida via API antes de avançar
    setValidating(true);
    setValidateError(null);
    try {
      const result = await pixSendService.validateKey(keyType, key);
      if (!result.valida) {
        setValidateError('Chave Pix inválida. Verifique o valor digitado.');
        return;
      }
      if (!result.cadastrada) {
        setValidateError('Chave Pix não encontrada. Verifique se está correta.');
        return;
      }
      setValidated(true);
      lastValidated.current = key;
      void onConfirm(key, keyType);
    } catch {
      setValidateError('Não foi possível validar a chave. Tente novamente.');
    } finally {
      setValidating(false);
    }
  }

  const isSubmitting = isLoading || validating;
  const canSubmit = hasValue && !!keyType && !isSubmitting;

  return (
    <div className="flex flex-col h-full bg-bg">
      {/* Header */}
      <div className="px-4 pt-6 pb-2">
        <BackButton onClick={onClose} label="Fechar envio de PIX" />
        <h1 className="text-title font-bold text-text leading-tight mt-5">Enviar PIX</h1>
        <p className="text-sm text-text-secondary mt-1">
          Preencha os dados para realizar a transferência
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col flex-1 px-4 pt-5"
      >
        {loadingContacts && <p className="mb-4 text-xs text-text-secondary">Carregando contatos salvos...</p>}
        {contactsError && <p role="status" className="mb-4 text-xs text-text-secondary">{contactsError}</p>}
        {contacts.length > 0 && (
          <label htmlFor="saved-pix-contact" className="mb-5 flex flex-col gap-1 text-xs text-text-secondary">
            Usar contato salvo
            <select
              id="saved-pix-contact"
              defaultValue=""
              disabled={isLoading || validating}
              onChange={(event) => {
                const contact = contacts.find((item) => item.id === event.target.value);
                if (!contact) return;
                setKey(contact.chavePix, contact.tipoChave);
                setValidated(false);
                setValidateError(null);
                lastValidated.current = '';
              }}
              className="h-10 rounded-md border border-bg-input bg-bg-input px-3 text-sm text-text focus:border-brand-logo focus:outline-none focus:ring-1 focus:ring-brand-logo"
            >
              <option value="">Selecione um contato</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>{contact.nome} · {pixKeyLabels[contact.tipoChave]}</option>
              ))}
            </select>
          </label>
        )}
        <p className="text-sm font-bold text-text mb-3">Chave PIX do destinatário</p>

        {/* Input */}
        <div className="relative mb-1">
          <input
            id="chavePix"
            type="text"
            inputMode={keyType === 'EMAIL' || keyType === 'ALEATORIO' ? 'text' : 'numeric'}
            placeholder="CPF, e-mail, celular ou chave aleatória"
            autoComplete="off"
            autoFocus
            disabled={isSubmitting}
            value={displayValue}
            onChange={handleInputChange}
            className="w-full bg-transparent border-0 border-b-2 border-text-secondary
              text-sm text-text placeholder:text-text-secondary
              focus:outline-none focus:border-brand-element
              pb-2 pr-8 transition-colors disabled:opacity-60"
          />
          {/* Ícone de status */}
          {hasValue && (
            <span className="absolute right-0 top-0 pointer-events-none">
              {validating
                ? <CircleNotch size={22} className="text-text-secondary animate-spin" />
                : validated
                ? <CheckCircle size={22} weight="fill" className="text-brand-element" />
                : keyType
                ? <CheckCircle size={22} weight="regular" className="text-text-secondary" />
                : null}
            </span>
          )}
        </div>

        {/* Tipo detectado */}
        {typeLabel && hasValue && !validateError && (
          <p className="mt-1 text-xs text-text-secondary">
            Tipo detectado: <span className="text-text-tertiary font-medium">{typeLabel}</span>
          </p>
        )}

        {/* Erros */}
        {(validateError || error) && (
          <p className="mt-1.5 text-xs text-text-negative">{validateError || error}</p>
        )}

        {/* Card "Fazer PIX para" */}
        {hasValue && keyType && (
          <button
            type="submit"
            disabled={!canSubmit}
            className="mt-4 flex items-center justify-between rounded-xl bg-bg-input px-4 py-3.5
              text-left transition-colors hover:bg-bg-input-hover active:scale-95
              disabled:opacity-60
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-logo"
          >
            <div>
              <p className="text-xs text-text-secondary mb-0.5">Fazer PIX para:</p>
              <p className="text-sm text-text font-medium">{displayValue.trim()}</p>
            </div>
            {isSubmitting
              ? <span className="text-xs text-text-secondary animate-pulse">Validando...</span>
              : <ArrowRight size={18} weight="bold" className="text-text-secondary shrink-0" />
            }
          </button>
        )}

        <div className="flex-1" />
      </form>
    </div>
  );
}
