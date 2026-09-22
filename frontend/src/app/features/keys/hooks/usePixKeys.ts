import { useState } from 'react';
import type { PixKey } from '../types';

const initialKeys: PixKey[] = [
  { id: '1', type: 'cpf', value: '999.999.999-08', status: 'active' },
  { id: '2', type: 'email', value: 'geovana@gmail.com', status: 'suspended' },
  { id: '3', type: 'phone', value: '4002 8922', status: 'active' },
  { id: '4', type: 'random', value: 'f3o9-dkb3-3lajf', status: 'active' },
];

export function usePixKeys() {
  const [keys, setKeys] = useState<PixKey[]>(initialKeys);

  function toggleStatus(target: PixKey) {
    setKeys((prev) =>
      prev.map((k) =>
        k.id === target.id
          ? { ...k, status: k.status === 'active' ? 'suspended' : 'active' }
          : k,
      ),
    );
  }

  return { keys, toggleStatus };
}