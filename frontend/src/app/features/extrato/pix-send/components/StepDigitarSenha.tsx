'use client';
import { useState, type FormEvent } from 'react';
import { BackButton } from '@/app/shared/components/ui';
import { Button } from '@/app/shared/components/ui/button';
import { Input } from '@/app/shared/components/ui/input';
import { senhaSchema } from '../schemas/pix-send.schema';

interface Props {
  onConfirm: (password: string) => Promise<void>; // eslint-disable-line no-unused-vars
  onBack: () => void;
  onClose: () => void;
  isLoading: boolean;
  outcomeUnknown: boolean;
  error: string | null;
}
export function StepDigitarSenha({ onConfirm, onBack, onClose, isLoading, outcomeUnknown, error }: Props) {
  const [password, setPassword] = useState('');
  const [validation, setValidation] = useState<string | null>(null);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (isLoading) return;
    const result = senhaSchema.safeParse({ senha: password });
    if (!result.success) { setValidation(result.error.issues[0].message); return; }
    setValidation(null);
    const confirmation = password;
    setPassword('');
    void onConfirm(confirmation);
  }
  return (
    <div className="flex h-full flex-col p-4 pt-6">
      {!isLoading && <BackButton onClick={outcomeUnknown ? onClose : onBack} label={outcomeUnknown ? 'Fechar envio pendente' : 'Voltar'} />}
      <h2 className="mt-5 text-lg font-semibold text-text">Confirme com sua senha</h2>
      <p className="mt-2 text-sm text-text-secondary">Use a mesma senha com que você entra na conta.</p>
      <form onSubmit={submit} className="mt-6 flex flex-1 flex-col gap-4">
        <label htmlFor="pix-confirm-password" className="text-sm text-text">Senha de acesso</label>
        <Input id="pix-confirm-password" type="password" autoComplete="current-password" maxLength={72} value={password}
          disabled={isLoading} onChange={(event) => setPassword(event.target.value)} />
        {(validation || error) && <p role="alert" className="text-sm text-text-negative">{validation || error}</p>}
        {outcomeUnknown && <p className="text-xs text-text-secondary">Ao tentar novamente, consultaremos ou concluiremos o pedido original. Se fechar, você poderá retomá-lo nesta aba.</p>}
        <div className="flex-1" />
        <Button className="mb-4 w-full" type="submit" disabled={isLoading || !password}>{isLoading ? 'Confirmando...' : outcomeUnknown ? 'Consultar ou concluir envio' : 'Confirmar envio de Pix'}</Button>
      </form>
    </div>
  );
}
