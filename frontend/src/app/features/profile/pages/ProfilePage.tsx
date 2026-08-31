import { Pencil } from 'lucide-react';
import { Button } from '@/app/shared/components/ui/button';

export function ProfilePage() {
  const email = 'geovana@gmail.com';

  return (
    <div className="mx-auto w-full max-w-sm px-4 pb-6 pt-8">
      <h1 className="mb-4 text-center text-sm font-medium text-text-secondary">
        Perfil do usuário e conta
      </h1>

      <div className="rounded-2xl border border-bg-input bg-bg-input/30 p-5">
        <p className="mb-4 text-center text-xs font-medium text-text-secondary">Sua Conta</p>

        <div className="mb-4 flex flex-col items-center gap-1">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-element text-lg font-semibold text-text">
            G
          </span>
          <div className="flex items-center gap-1">
            <p className="text-sm font-medium text-text">Geovana Veras</p>
            <button className="text-text-secondary hover:text-text">
              <Pencil className="h-3 w-3" />
            </button>
          </div>
          <p className="text-xs text-text-secondary">Conta 04321</p>
        </div>

        <div className="border-t border-bg-input pt-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs text-text-secondary">Email</span>
            <button className="text-text-secondary hover:text-text">
              <Pencil className="h-3 w-3" />
            </button>
          </div>
          <p className="border-b border-bg-input pb-3 text-sm text-text">{email}</p>

          <button className="mt-3 block text-xs font-medium text-brand-element hover:underline">
            Alterar Senha &gt;
          </button>

          <div className="mt-3 border-b border-bg-input pb-3">
            <p className="text-xs text-text-secondary">Nenhuma chave cadastrada</p>
            <button className="text-xs font-medium text-brand-element hover:underline">
              Gerenciar Chaves &gt;
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <Button className="w-full">Sair</Button>
          <Button
            variant="outline"
            className="w-full border-text-negative text-text-negative hover:bg-text-negative/10"
          >
            Excluir conta
          </Button>
        </div>
      </div>
    </div>
  );
}