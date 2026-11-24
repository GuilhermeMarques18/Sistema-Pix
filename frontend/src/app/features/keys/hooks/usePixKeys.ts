import { useCallback, useEffect, useState } from 'react';
import { getApiErrorMessage } from '@/app/shared/lib/apiError';
import { KeyEndpointUnavailableError, pixKeysService } from '../services/pixKeys.service';
import type { PixKey, PixKeyType } from '../types';

export function usePixKeys() {
  const [keys, setKeys] = useState<PixKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setKeys(await pixKeysService.listMine());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar suas chaves.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createKey(type: PixKeyType, value?: string): Promise<PixKey> {
    const created = await pixKeysService.create(type, value);
    setKeys((prev) => [created, ...prev]);
    return created;
  }

  /** Suspende ou desbloqueia a chave. Só muda a tela se a API confirmar. */
  async function toggleStatus(target: PixKey) {
    setNotice(null);
    const next = target.status === 'active' ? 'suspended' : 'active';
    try {
      const updated = await pixKeysService.setStatus(target.id, next);
      setKeys((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
    } catch (err) {
      setNotice(
        err instanceof KeyEndpointUnavailableError
          ? err.message
          : getApiErrorMessage(err, 'Não foi possível alterar o status da chave.'),
      );
    }
  }

  /** Altera o valor da chave. Lança erro para a tela de edição exibir. */
  async function updateKey(target: PixKey, value?: string): Promise<PixKey> {
    const updated = await pixKeysService.update(target.id, target.type, value);
    setKeys((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
    return updated;
  }

  return { keys, isLoading, error, notice, reload: load, createKey, toggleStatus, updateKey };
}
