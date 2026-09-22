import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PencilSimpleIcon } from '@phosphor-icons/react';
import { Button } from '@/app/shared/components/ui/button';
import { Input } from '@/app/shared/components/ui/input';

export function ProfilePage() {
  const navigate = useNavigate();

  const [name, setName] = useState('Geovana Veras');
  const [email, setEmail] = useState('geovana@gmail.com');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  function handleSaveName() {
    setIsEditingName(false);
    window.alert('Nome atualizado com sucesso!');
  }

  function handleSaveEmail() {
    setIsEditingEmail(false);
    window.alert('E-mail atualizado com sucesso!');
  }

  function handleChangePassword() {
    window.alert('Funcionalidade de alterar senha ainda não implementada.');
  }

  function handleLogout() {
    window.alert('Você saiu da sua conta.');
  }

  function handleDeleteAccount() {
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir sua conta? Essa ação não pode ser desfeita.',
    );
    if (confirmed) {
      window.alert('Conta excluída com sucesso.');
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm px-4 pb-6 pt-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-bg-input text-text transition-colors hover:bg-bg-input"
      >
        <ArrowLeftIcon className="h-4 w-4" />
      </button>

      <h1 className="mb-4 text-center text-sm font-medium text-text-secondary">
        Perfil do usuário e conta
      </h1>

      <div className="rounded-2xl border border-bg-input bg-bg-input/30 p-5">
        <p className="mb-4 text-center text-xs font-medium text-text-secondary">Sua Conta</p>

        <div className="mb-4 flex flex-col items-center gap-1">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-element text-lg font-semibold text-text">
            {name.charAt(0).toUpperCase()}
          </span>

          {isEditingName ? (
            <div className="mt-1 flex w-full items-center gap-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
              <Button size="sm" onClick={handleSaveName}>
                Salvar
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <p className="text-sm font-medium text-text">{name}</p>
              <button
                onClick={() => setIsEditingName(true)}
                className="text-text-secondary hover:text-text"
              >
                <PencilSimpleIcon className="h-3 w-3" />
              </button>
            </div>
          )}

          <p className="text-xs text-text-secondary">Conta 04321</p>
        </div>

        <div className="border-t border-bg-input pt-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-text-secondary">Email</span>
            {!isEditingEmail && (
              <button
                onClick={() => setIsEditingEmail(true)}
                className="text-text-secondary hover:text-text"
              >
                <PencilSimpleIcon className="h-3 w-3" />
              </button>
            )}
          </div>

          {isEditingEmail ? (
            <div className="flex items-center gap-2 pb-3">
              <Input value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
              <Button size="sm" onClick={handleSaveEmail}>
                Salvar
              </Button>
            </div>
          ) : (
            <p className="border-b border-bg-input pb-3 text-sm text-text">{email}</p>
          )}

          <button
            onClick={handleChangePassword}
            className="mt-3 block text-xs font-medium text-brand-element hover:underline"
          >
            Alterar Senha &gt;
          </button>

          <div className="mt-3 border-b border-bg-input pb-3">
            <p className="text-xs text-text-secondary">Nenhuma chave cadastrada</p>
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
          >
            Excluir conta
          </Button>
        </div>
      </div>
    </div>
  );
}