'use client';

import { Clock, SignOut } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { tokenService } from '@/app/core/auth';
import { PixIcon } from '@/app/shared/components/ui';

export function AccountPendingPage() {
  const navigate = useNavigate();

  function handleLogout() {
    tokenService.remove();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex min-h-[100dvh] w-full items-center justify-center bg-bg px-4">
      <div className="flex flex-col items-center text-center max-w-sm">
        <PixIcon size={48} className="mb-6" />

        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-text-warning/10">
          <Clock size={32} className="text-text-warning" weight="fill" />
        </div>

        <h1 className="text-xl font-bold text-text mb-2">Conta em análise</h1>
        <p className="text-sm text-text-secondary leading-relaxed mb-8">
          Sua conta foi criada com sucesso e está aguardando aprovação da nossa equipe.
          Assim que for liberada, você receberá acesso completo ao sistema.
        </p>

        <div className="w-full rounded-xl bg-bg-input p-4 mb-8 text-left">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">O que acontece agora?</p>
          <ul className="flex flex-col gap-2">
            {[
              'Nossa equipe irá revisar seus dados',
              'Você será notificado quando aprovado',
              'Após aprovação, terá acesso total',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-text">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-element/10 text-xs font-bold text-brand-element">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text transition-colors"
        >
          <SignOut size={16} />
          Sair da conta
        </button>
      </div>
    </div>
  );
}
