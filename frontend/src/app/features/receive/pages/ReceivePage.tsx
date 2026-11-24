import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePixKeys } from '@/app/features/keys';
import { useCurrentUser } from '@/app/shared/hooks';
import { PageHeader } from '@/app/shared/components/ui/page-header';
import { Button } from '@/app/shared/components/ui/button';
import { pixKeyMeta } from '@/app/features/keys/lib/pixKeyMeta';
import { formatPixKey } from '@/app/features/keys/lib/formatPixKey';

export function ReceivePage() {
  const { keys, isLoading, error, reload } = usePixKeys();
  const { account } = useCurrentUser();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<string | null>(null);
  const activeKeys = keys.filter((key) => key.status === 'active');
  async function copy(value: string) {
    try { await navigator.clipboard.writeText(value); setFeedback('Chave copiada. Compartilhe com quem vai enviar o Pix.'); }
    catch { setFeedback('Não foi possível copiar. Selecione e copie a chave exibida.'); }
  }
  return (
    <div className="mx-auto max-w-md pb-6">
      <PageHeader title="Receber Pix" subtitle="Compartilhe uma das suas chaves" />
      <div className="flex flex-col gap-4 p-4">
        {account?.status === 'BLOQUEADA' && <p role="alert" className="text-text-negative">Sua conta está bloqueada e não pode receber Pix no momento.</p>}
        {isLoading && <p role="status" className="text-text-secondary">Carregando suas chaves...</p>}
        {error && <div role="alert" className="text-text-negative">{error}<Button className="mt-2" onClick={() => void reload()}>Tentar novamente</Button></div>}
        {!isLoading && !error && keys.length === 0 && <p className="text-text-secondary">Cadastre uma chave para compartilhar seus dados de recebimento.</p>}
        {!isLoading && !error && keys.length > 0 && activeKeys.length === 0 && (
          <p className="text-text-secondary">Suas chaves estão suspensas. Desbloqueie uma chave em Minhas Chaves para receber Pix por ela.</p>
        )}
        {!isLoading && !error && activeKeys.map((key) => (
          <div key={key.id} className="space-y-3 rounded-xl bg-bg-input p-4">
            <p className="text-sm text-text-secondary">{pixKeyMeta[key.type].label}</p>
            <p className="select-all break-all text-text">{formatPixKey(key.type, key.value)}</p>
            <Button variant="outline" onClick={() => void copy(key.value)} disabled={account?.status === 'BLOQUEADA'}>Copiar chave</Button>
          </div>
        ))}
        {feedback && <p role="status" className="text-sm text-text-secondary">{feedback}</p>}
        <Button variant="outline" onClick={() => navigate('/keys')}>Gerenciar minhas chaves</Button>
        <Button onClick={() => navigate('/keys/new')}>Cadastrar chave</Button>
      </div>
    </div>
  );
}
