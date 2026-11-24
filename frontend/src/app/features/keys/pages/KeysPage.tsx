import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/app/shared/components/ui/page-header';
import { Button } from '@/app/shared/components/ui/button';
import { KeyListItem } from '../components/KeyListItem';
import { usePixKeys } from '../hooks/usePixKeys';
import type { PixKey } from '../types';

export function KeysPage() {
  const navigate = useNavigate();
  const { keys, isLoading, error, notice, statusMessage, changingKeyIds, reload, toggleStatus } = usePixKeys();

  function handleEdit(key: PixKey) {
    navigate(`/keys/${key.id}/edit`);
  }

  return (
    <div className="pb-6">
      <PageHeader
        title="Minhas Chaves"
        subtitle="Gerencie suas chaves PIX"
        action={
          <Button size="sm" onClick={() => navigate('/keys/new')}>
            + Nova chave
          </Button>
        }
      />

      <div className="mt-6 flex flex-col gap-3 px-4">
        <p className="text-xs text-text-secondary">
          Suspender mantém a chave reservada para você, mas impede recebimentos por ela. Desbloqueie quando quiser voltar a usá-la.
        </p>
        {isLoading && <p className="text-sm text-text-secondary">Carregando chaves...</p>}

        {error && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-text-negative">{error}</p>
            <Button size="sm" variant="outline" onClick={reload}>
              Tentar novamente
            </Button>
          </div>
        )}

        {notice && (
          <p role="alert" className="rounded-lg bg-bg-input/40 px-3 py-2 text-xs text-warning">
            {notice}
          </p>
        )}

        {statusMessage && <p role="status" className="rounded-lg bg-bg-input/40 px-3 py-2 text-xs text-brand-element">{statusMessage}</p>}

        {!isLoading && !error && keys.length === 0 && (
          <p className="text-sm text-text-secondary">
            Você ainda não tem chaves PIX. Toque no botão + Nova chave para cadastrar.
          </p>
        )}

        {keys.map((key) => (
          <KeyListItem key={key.id} pixKey={key} isChangingStatus={changingKeyIds.includes(key.id)} onEdit={handleEdit} onToggleStatus={toggleStatus} />
        ))}
      </div>
    </div>
  );
}
