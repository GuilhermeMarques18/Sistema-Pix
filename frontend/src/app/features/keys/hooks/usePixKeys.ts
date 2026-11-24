import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiErrorMessage } from '@/app/shared/lib/apiError';
import { pixKeysService } from '../services/pixKeys.service';
import type { PixKey, PixKeyType } from '../types';

export function usePixKeys() {
  const [keys, setKeys] = useState<PixKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [changingKeyIds, setChangingKeyIds] = useState<string[]>([]);
  const pendingChanges = useRef(new Set<string>());

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
    if (pendingChanges.current.has(target.id)) return;
    pendingChanges.current.add(target.id);
    setChangingKeyIds((current) => [...current, target.id]);
    setNotice(null);
    setStatusMessage(null);
    const next = target.status === 'active' ? 'suspended' : 'active';
    try {
      const updated = await pixKeysService.setStatus(target.id, next);
      setKeys((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
      setStatusMessage(updated.status === 'suspended'
        ? 'Chave suspensa. Ela continua reservada para você e não pode receber Pix até ser desbloqueada.'
        : 'Chave desbloqueada. Ela pode ser usada para receber Pix novamente.');
    } catch (err) {
      setNotice(getApiErrorMessage(err, 'Não foi possível alterar o status da chave.'));
    } finally {
      pendingChanges.current.delete(target.id);
      setChangingKeyIds((current) => current.filter((id) => id !== target.id));
    }
  }

  /** Altera o valor da chave. Lança erro para a tela de edição exibir. */
  async function updateKey(target: PixKey, value?: string): Promise<PixKey> {
    const updated = await pixKeysService.update(target.id, target.type, value);
    setKeys((prev) => prev.map((k) => (k.id === updated.id ? updated : k)));
    return updated;
  }

  return { keys, isLoading, error, notice, statusMessage, changingKeyIds, reload: load, createKey, toggleStatus, updateKey };
}
