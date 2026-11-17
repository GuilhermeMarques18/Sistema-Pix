import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import { Button } from '@/app/shared/components/ui/button';
import { Input } from '@/app/shared/components/ui/input';
import { Label } from '@/app/shared/components/ui/label';
import { useCurrentUser } from '@/app/shared/hooks';
import { getApiErrorMessage } from '@/app/shared/lib/apiError';
import { authService } from '@/app/features/auth';
import { usePixKeys } from '@/app/features/keys';

export function ProfilePage() {
  const navigate = useNavigate();
  const { account, user, isLoading, error, reload, updateUser, deleteUser } = useCurrentUser();
  const { keys } = usePixKeys();

  // Qual campo está em edição (só um por vez) e o valor digitado
  const [editing, setEditing] = useState<'name' | 'email' | null>(null);
  const [draft, setDraft] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  function startEditing(field: 'name' | 'email') {
    if (!user) return;
    setFeedback(null);
    setDraft(field === 'name' ? user.name : user.email);
    setEditing(field);
  }

  async function handleSave() {
    if (!editing) return;
    setIsSaving(true);
    setFeedback(null);
    try {
      await updateUser(editing === 'name' ? { name: draft.trim() } : { email: draft.trim() });
      setEditing(null);
    } catch (err) {
      setFeedback(getApiErrorMessage(err, 'Não foi possível salvar as alterações.'));
    } finally {
      setIsSaving(false);
    }
  }

  function handleChangePassword() {
    // TODO: o backend ainda não possui endpoint de troca de senha.
    window.alert('Alterar senha ainda não está disponível: falta o endpoint no backend.');
  }

  function handleLogout() {
    authService.logout();
    navigate('/login');
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.',
    );
    if (!confirmed) return;
    setIsDeleting(true);
    setFeedback(null);
    try {
      await deleteUser();
      authService.logout();
      navigate('/login');
    } catch (err) {
      setFeedback(getApiErrorMessage(err, 'Não foi possível excluir a conta.'));
      setIsDeleting(false);
    }
  }

  const keysLabel =
    keys.length === 0
      ? 'Nenhuma chave cadastrada'
      : `${keys.length} ${keys.length === 1 ? 'chave cadastrada' : 'chaves cadastradas'}`;

  return (
    <div className="mx-auto w-full max-w-sm px-4 pb-6 pt-4">
      <button
        onClick={() => navigate(-1)}
        aria-label="Voltar"
        className="mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-bg-input text-text transition-colors hover:bg-bg-input active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-logo"
      >
        <ArrowLeftIcon className="h-4 w-4" />
      </button>

      <h1 className="mb-4 text-center text-sm font-medium text-text-secondary">
        Perfil do usuário e conta
      </h1>

      {isLoading && <p className="text-center text-sm text-text-secondary">Carregando...</p>}

      {error && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-text-negative">{error}</p>
          <Button size="sm" variant="outline" onClick={reload}>
            Tentar novamente
          </Button>
        </div>
      )}

      {user && account && (
        <div className="rounded-2xl border border-bg-input bg-bg-input/30 p-5">
          <p className="mb-4 text-center text-xs font-medium text-text-secondary">Sua Conta</p>

          <div className="mb-4 flex flex-col items-center gap-1">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-element text-lg font-semibold text-text">
              {user.name.charAt(0).toUpperCase()}
            </span>

            {editing === 'name' ? (
              <div className="mt-1 flex w-full items-center gap-2">
                <Label htmlFor="profile-name" className="sr-only">
                  Nome
                </Label>
                <Input
                  id="profile-name"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  autoFocus
                />
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <p className="text-sm font-medium text-text">{user.name}</p>
                <button
                  onClick={() => startEditing('name')}
                  aria-label="Editar nome"
                  className="text-text-secondary hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-logo"
                >
                  <PencilSimpleIcon className="h-3 w-3" />
                </button>
              </div>
            )}

            <p className="text-xs text-text-secondary">Conta {account.id.slice(0, 8)}</p>
          </div>

          <div className="border-t border-bg-input pt-4">
            <div className="mb-1 flex items-center justify-between">
              <Label htmlFor="profile-email" className="text-xs">
                Email
              </Label>
              {editing !== 'email' && (
                <button
                  onClick={() => startEditing('email')}
                  aria-label="Editar e-mail"
                  className="text-text-secondary hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-logo"
                >
                  <PencilSimpleIcon className="h-3 w-3" />
                </button>
              )}
            </div>

            {editing === 'email' ? (
              <div className="flex items-center gap-2 pb-3">
                <Input
                  id="profile-email"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  autoFocus
                />
                <Button size="sm" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            ) : (
              <p className="border-b border-bg-input pb-3 text-sm text-text">{user.email}</p>
            )}

            {feedback && <p className="mt-2 text-xs text-text-negative">{feedback}</p>}

            <button
              onClick={handleChangePassword}
              className="mt-3 block text-xs font-medium text-brand-element hover:underline"
            >
              Alterar Senha &gt;
            </button>

            <div className="mt-3 border-b border-bg-input pb-3">
              <p className="text-xs text-text-secondary">{keysLabel}</p>
              <button
                onClick={() => navigate('/keys')}
                className="text-xs font-medium text-brand-element hover:underline"
              >
                Gerenciar Chaves &gt;
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2">
            <Button className="w-full" onClick={handleLogout}>
              Sair
            </Button>
            <Button
              variant="outline"
              className="w-full border-text-negative text-text-negative hover:bg-text-negative/10"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir conta'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
