import { useState, useEffect, useCallback } from 'react';
import { adminService, type AdminUser } from '../services/admin.service';

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminService.listUsers();
      setUsers(data);
    } catch {
      setError('Não foi possível carregar os usuários.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function updateRole(userId: string, role: 'USER' | 'ADMIN') {
    try {
      setActionLoadingId(userId);
      const updated = await adminService.updateUserRole(userId, role);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? updated : u))
      );
    } catch {
      setError('Erro ao atualizar papel do usuário.');
    } finally {
      setActionLoadingId(null);
    }
  }

  return {
    users,
    isLoading,
    error,
    actionLoadingId,
    updateRole,
    refetch: fetchUsers,
  };
}
