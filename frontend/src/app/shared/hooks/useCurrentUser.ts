import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '@/app/shared/lib/apiError';
import {
  userService,
  type CurrentAccount,
  type UpdateUserPayload,
  type UserProfile,
} from '@/app/shared/services/user.service';

/** Dados do usuário e da conta logados. Compartilhado entre features (perfil, chaves...). */
export function useCurrentUser() {
  const [account, setAccount] = useState<CurrentAccount | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const acc = await userService.getMyAccount();
      setAccount(acc);
      setUser(await userService.getUser(acc.userId));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar seus dados.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Atualiza nome/e-mail. Lança erro (com mensagem do backend) se falhar. */
  async function updateUser(payload: UpdateUserPayload) {
    setUser(await userService.updateMe(payload));
  }

  async function deleteUser() {
    if (!user) return;
    await userService.deleteUser(user.id);
  }

  return { account, user, isLoading, error, reload: load, updateUser, deleteUser };
}
