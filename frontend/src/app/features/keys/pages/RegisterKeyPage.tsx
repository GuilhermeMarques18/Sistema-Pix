import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/app/shared/components/ui/page-header';
import { Label } from '@/app/shared/components/ui/label';
import { Input } from '@/app/shared/components/ui/input';
import { Button } from '@/app/shared/components/ui/button';
import { pixKeyMeta } from '../lib/pixKeyMeta';
import type { PixKeyType } from '../types';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterKeyPage() {
  const { type } = useParams<{ type: PixKeyType }>();
  const navigate = useNavigate();
  const [value, setValue] = useState('');

  if (!type || !(type in pixKeyMeta)) return null;

  const meta = pixKeyMeta[type];
  const isValid = type === 'email' ? emailRegex.test(value) : value.trim().length > 0;

  function handleSubmit() {
    if (!isValid) return;
    // TODO: chamar API para registrar a chave
    navigate('/keys');
  }

  return (
    <div className="flex min-h-screen flex-col pb-6">
      <PageHeader
        title={`Registrar ${meta.label.toLowerCase()}`}
        subtitle={`Preencha a chave do tipo ${meta.label} que você quer utilizar para receber transferências por PIX.`}
      />

      <div className="mt-6 flex-1 px-4">
        <Label htmlFor="pix-key-value">{meta.label}</Label>
        <Input
          id="pix-key-value"
          className="mt-2"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={type === 'email' ? 'seuemail@exemplo.com' : ''}
        />
        {value.length > 0 && (
          <p className={`mt-1 text-xs ${isValid ? 'text-brand-element' : 'text-text-negative'}`}>
            {isValid ? 'Chave válida' : 'Chave inválida'}
          </p>
        )}
      </div>

      <div className="px-4">
        <Button className="w-full" size="lg" disabled={!isValid} onClick={handleSubmit}>
          Confirmar
        </Button>
      </div>
    </div>
  );
}