import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/app/shared/components/ui/button';
import { Input } from '@/app/shared/components/ui/input';
import { PageHeader } from '@/app/shared/components/ui/page-header';
import { getApiErrorMessage } from '@/app/shared/lib/apiError';
import { normalizePixKey } from '@/app/shared/lib/pixKey';
import { pixKeyLabels } from '@/app/shared/lib/pixKey';
import type { PixKeyType } from '@/app/shared/types/api.types';
import { pixContactsService, type PixContact } from '../services/pixContacts.service';

const keyTypes: PixKeyType[] = ['CPF', 'CNPJ', 'EMAIL', 'CELULAR', 'ALEATORIO'];

export function ContactsPage() {
  const [contacts, setContacts] = useState<PixContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<PixContact | null>(null);
  const [name, setName] = useState('');
  const [keyType, setKeyType] = useState<PixKeyType>('CPF');
  const [key, setKey] = useState('');

  const loadContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setContacts(await pixContactsService.listMine());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar seus contatos PIX.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  function resetForm() {
    setEditing(null);
    setName('');
    setKeyType('CPF');
    setKey('');
    setError(null);
  }

  function startEditing(contact: PixContact) {
    setEditing(contact);
    setName(contact.nome);
    setKeyType(contact.tipoChave);
    setKey(contact.chavePix);
    setMessage(null);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    let normalizedKey: string;
    try {
      normalizedKey = normalizePixKey(keyType, key);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chave PIX inválida.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = { nome: name.trim(), tipoChave: keyType, chavePix: normalizedKey };
      const saved = editing
        ? await pixContactsService.update(editing.id, payload)
        : await pixContactsService.create(payload);
      setContacts((current) => editing
        ? current.map((contact) => contact.id === saved.id ? saved : contact).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
        : [...current, saved].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')));
      setMessage(editing ? 'Contato atualizado com sucesso.' : 'Contato adicionado com sucesso.');
      resetForm();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível salvar o contato.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(contact: PixContact) {
    if (!window.confirm(`Excluir o contato "${contact.nome}"?`)) return;
    setError(null);
    setMessage(null);
    try {
      await pixContactsService.remove(contact.id);
      setContacts((current) => current.filter((item) => item.id !== contact.id));
      if (editing?.id === contact.id) resetForm();
      setMessage('Contato excluído com sucesso.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível excluir o contato.'));
    }
  }

  return (
    <div className="pb-6">
      <PageHeader title="Contatos PIX" subtitle="Salve destinatários para enviar ou agendar com mais rapidez" />

      <div className="mt-6 flex flex-col gap-5 px-4">
        {error && <p role="alert" className="rounded-lg bg-text-negative/10 px-3 py-2 text-sm text-text-negative">{error}</p>}
        {message && <p role="status" className="rounded-lg bg-brand-element/10 px-3 py-2 text-sm text-brand-element">{message}</p>}

        <form onSubmit={handleSubmit} className="rounded-xl border border-bg-input bg-bg p-4">
          <h2 className="mb-4 text-base font-semibold text-text">{editing ? 'Editar contato' : 'Adicionar contato'}</h2>
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm text-text-secondary" htmlFor="contact-name">
              Nome ou apelido
              <Input id="contact-name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={80} required />
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-secondary" htmlFor="contact-key-type">
              Tipo da chave PIX
              <select
                id="contact-key-type"
                value={keyType}
                onChange={(event) => {
                  const selectedType = event.target.value;
                  if (keyTypes.includes(selectedType as PixKeyType)) setKeyType(selectedType as PixKeyType);
                }}
                className="h-10 rounded-md border border-bg-input bg-bg-input px-3 text-sm text-text focus:border-brand-logo focus:outline-none focus:ring-1 focus:ring-brand-logo"
              >
                {keyTypes.map((type) => <option key={type} value={type}>{pixKeyLabels[type]}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-text-secondary" htmlFor="contact-pix-key">
              Chave PIX
              <Input
                id="contact-pix-key"
                value={key}
                onChange={(event) => setKey(event.target.value)}
                maxLength={77}
                autoComplete="off"
                required
              />
            </label>
            <div className="flex gap-2">
              <Button type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : editing ? 'Salvar alterações' : 'Adicionar contato'}</Button>
              {editing && <Button type="button" variant="outline" onClick={resetForm} disabled={isSaving}>Cancelar</Button>}
            </div>
          </div>
        </form>

        <section aria-labelledby="saved-contacts-title">
          <h2 id="saved-contacts-title" className="mb-3 text-base font-semibold text-text">Seus contatos</h2>
          {isLoading && <p className="text-sm text-text-secondary">Carregando contatos...</p>}
          {!isLoading && error && contacts.length === 0 && (
            <Button size="sm" variant="outline" onClick={() => void loadContacts()}>Tentar novamente</Button>
          )}
          {!isLoading && !error && contacts.length === 0 && (
            <p className="rounded-xl bg-bg-input/50 p-4 text-sm text-text-secondary">Você ainda não salvou contatos PIX. Adicione um contato acima para encontrá-lo ao enviar ou agendar um PIX.</p>
          )}
          <div className="flex flex-col gap-3">
            {contacts.map((contact) => (
              <article key={contact.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-bg-input p-4">
                <div className="min-w-0">
                  <h3 className="font-medium text-text">{contact.nome}</h3>
                  <p className="text-xs text-text-secondary">{pixKeyLabels[contact.tipoChave]}</p>
                  <p className="break-all text-sm text-text">{contact.chavePix}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEditing(contact)}>Editar</Button>
                  <Button size="sm" variant="destructive" onClick={() => void handleDelete(contact)}>Excluir</Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
