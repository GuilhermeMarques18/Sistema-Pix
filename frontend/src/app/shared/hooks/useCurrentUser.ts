import { useSession } from '@/app/core/auth/SessionProvider';

/** Uma única fonte de perfil/conta para os consumidores da sessão. */
export function useCurrentUser() {
  return useSession();
}
