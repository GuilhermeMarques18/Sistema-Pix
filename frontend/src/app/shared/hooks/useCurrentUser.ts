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
      
      const id = acc.userId || (acc as any).usuarioId || (acc as any).idUsuario || (acc as any).id;
      
      console.log("DEBUG - Dados da Conta:", acc); 
      
      if (!id) {
        throw new Error("O backend não enviou o ID do usuário na conta.");
      }

      setUser(await userService.getUser(id));
      
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar seus dados.'));
    } finally {
      setIsLoading(false);
    }
  
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateUser(payload: UpdateUserPayload) {
    setUser(await userService.updateMe(payload));
  }

  async function deleteUser() {
    if (!user) return;
    await userService.deleteUser(user.id);
  }

  return { account, user, isLoading, error, reload: load, updateUser, deleteUser };
}
