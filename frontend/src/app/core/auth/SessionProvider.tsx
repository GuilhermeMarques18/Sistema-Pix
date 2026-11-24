'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { getApiErrorMessage } from '@/app/shared/lib/apiError';
import { userService } from '@/app/shared/services/user.service';
import type { AccountSummary, UpdateUserPayload, UserProfile } from '@/app/shared/types/api.types';
import { SESSION_CHANGED_EVENT, TOKEN_KEY, tokenService } from './token.service';

type SessionStatus = 'loading' | 'authenticated' | 'anonymous' | 'error';

interface SessionState {
  status: SessionStatus;
  user: UserProfile | null;
  account: AccountSummary | null;
  error: string | null;
}

interface SessionContextValue extends SessionState {
  isLoading: boolean;
  reload: () => Promise<void>;
  logout: () => void;
  updateUser: (payload: UpdateUserPayload) => Promise<void>; // eslint-disable-line no-unused-vars -- parâmetro do contrato TypeScript
  deleteUser: () => Promise<void>;
}

const emptySession = { user: null, account: null, error: null };
const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>({ ...emptySession, status: 'loading' });
  const requestVersion = useRef(0);
  const loadedToken = useRef<string | null>(null);
  const invalidateRequests = useCallback(() => { ++requestVersion.current; }, []);

  const reload = useCallback(async () => {
    const version = ++requestVersion.current;
    const token = tokenService.get();
    if (!token) {
      loadedToken.current = null;
      setSession({ ...emptySession, status: 'anonymous' });
      return;
    }

    setSession((current) => loadedToken.current === token && current.status === 'authenticated'
      ? current : { ...emptySession, status: 'loading' });
    try {
      const [user, account] = await Promise.all([userService.getMe(), userService.getMyAccount()]);
      if (version !== requestVersion.current || tokenService.get() !== token) return;
      loadedToken.current = token;
      setSession({ user, account, status: 'authenticated', error: null });
    } catch (error) {
      if (version !== requestVersion.current || tokenService.get() !== token) return;
      const message = getApiErrorMessage(error, 'Não foi possível carregar sua sessão.');
      setSession((current) => current.status === 'authenticated' ? { ...current, error: message } : {
        ...emptySession,
        status: 'error',
        error: message,
      });
    }
  }, []);

  useEffect(() => {
    const handleSessionChanged = () => { void reload(); };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === TOKEN_KEY || event.key === null) void reload();
    };
    window.addEventListener(SESSION_CHANGED_EVENT, handleSessionChanged);
    window.addEventListener('storage', handleStorage);
    void reload();
    return () => {
      invalidateRequests();
      window.removeEventListener(SESSION_CHANGED_EVENT, handleSessionChanged);
      window.removeEventListener('storage', handleStorage);
    };
  }, [reload, invalidateRequests]);

  const updateUser = useCallback(async (payload: UpdateUserPayload) => {
    const token = tokenService.get();
    const user = await userService.updateMe(payload);
    if (tokenService.get() !== token) return;
    setSession((current) => current.status === 'authenticated' ? {
      ...current,
      user,
      account: current.account ? { ...current.account, ownerName: user.name } : null,
    } : current);
  }, []);

  const deleteUser = useCallback(async () => {
    if (session.user) await userService.deleteUser(session.user.id);
  }, [session.user]);

  return (
    <SessionContext.Provider value={{
      ...session,
      isLoading: session.status === 'loading',
      reload,
      logout: tokenService.remove,
      updateUser,
      deleteUser,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession deve ser usado dentro de SessionProvider.');
  return context;
}
