'use client';
import { BackButton } from '@/app/shared/components/ui';
import { Button } from '@/app/shared/components/ui/button';
import { pixKeyLabels } from '@/app/shared/lib/pixKey';
import type { PixKeyType } from '@/app/shared/types/api.types';
import { usePixKeyMask } from '../hooks/usePixKeyMask';

interface Props {
  onConfirm: (key: string, type: PixKeyType) => Promise<void>; // eslint-disable-line no-unused-vars
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
}
export function StepInserirChave({ onConfirm, onClose, isLoading, error }: Props) {
  const { displayValue, keyType, setKeyType, handleChange } = usePixKeyMask();
  return (
    <div className="flex h-full flex-col p-4 pt-6">
      {!isLoading && <BackButton onClick={onClose} label="Fechar envio de Pix" />}
      <h1 className="mt-5 text-title font-bold text-text">Enviar Pix</h1>
      <p className="mt-1 text-sm text-text-secondary">Escolha o tipo e informe a chave do destinatário.</p>
      <form className="mt-6 flex flex-1 flex-col gap-4" onSubmit={(event) => { event.preventDefault(); void onConfirm(displayValue, keyType); }}>
        <label className="text-sm text-text" htmlFor="pix-key-type">Tipo de chave</label>
        <select id="pix-key-type" value={keyType} disabled={isLoading} onChange={(event) => setKeyType(event.target.value as PixKeyType)} className="rounded-lg border border-bg-input bg-bg-input p-3 text-text">
          {Object.entries(pixKeyLabels).map(([type, label]) => <option key={type} value={type}>{label}</option>)}
        </select>
        <label className="text-sm text-text" htmlFor="chavePix">Chave Pix</label>
        <input id="chavePix" autoComplete="off" maxLength={90} value={displayValue} disabled={isLoading}
          inputMode={keyType === 'CPF' || keyType === 'CNPJ' || keyType === 'CELULAR' ? 'tel' : 'text'}
          onChange={handleChange} className="rounded-lg border border-bg-input bg-bg-input p-3 text-text" />
        <p className="text-xs text-text-secondary">Confira o nome e o documento na próxima etapa.</p>
        {error && <p role="alert" className="text-sm text-text-negative">{error}</p>}
        <div className="flex-1" />
        <Button className="mb-4 w-full" type="submit" disabled={isLoading || !displayValue.trim()}>{isLoading ? 'Consultando...' : 'Consultar destinatário'}</Button>
      </form>
    </div>
  );
}
