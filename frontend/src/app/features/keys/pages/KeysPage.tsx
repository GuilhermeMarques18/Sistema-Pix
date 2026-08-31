import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/app/shared/components/ui/page-header';
import { Button } from '@/app/shared/components/ui/button';
import { KeyListItem } from '../components/KeyListItem';
import { usePixKeys } from '../hooks/usePixKeys';

export function KeysPage() {
  const navigate = useNavigate();
  const { keys, toggleStatus } = usePixKeys();

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
        {keys.map((key) => (
          <KeyListItem
            key={key.id}
            pixKey={key}
            onEdit={(k) => navigate(`/keys/${k.id}/edit`)}
            onToggleStatus={toggleStatus}
          />
        ))}
      </div>
    </div>
  );
}