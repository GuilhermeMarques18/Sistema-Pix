'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/app/shared/components/ui/button';
import { Input } from '@/app/shared/components/ui/input';
import { Label } from '@/app/shared/components/ui/label';
import { getApiErrorMessage } from '@/app/shared/lib/apiError';
import { scheduledPixService } from '../services/scheduledPix.service';
import type { ScheduledPix } from '../types/scheduledPix.types';

function toLocalDateTime(value: string): string {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ScheduledPixList() {
  const [schedules, setSchedules] = useState<ScheduledPix[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ScheduledPix | null>(null);
  const [cancelling, setCancelling] = useState<ScheduledPix | null>(null);
  const [amount, setAmount] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadSchedules = useCallback(async () => {
    setLoadError(null);
    try {
      setSchedules(await scheduledPixService.findPending());
    } catch (loadError) {
      setLoadError(getApiErrorMessage(loadError, 'Não foi possível carregar os Pix agendados.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSchedules();
    window.addEventListener('scheduled-pix-updated', loadSchedules);
    return () => window.removeEventListener('scheduled-pix-updated', loadSchedules);
  }, [loadSchedules]);

  function openEditor(schedule: ScheduledPix) {
    setActionError(null);
    setAmount(schedule.valor.toFixed(2));
    setScheduledAt(toLocalDateTime(schedule.scheduledAt));
    setDescription(schedule.descricao ?? '');
    setEditing(schedule);
  }

  async function saveSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;

    const value = Number(amount);
    const localDate = new Date(scheduledAt);
    if (!Number.isFinite(value) || value <= 0) {
      setActionError('Informe um valor maior que zero.');
      return;
    }
    if (!scheduledAt || !Number.isFinite(localDate.getTime()) || localDate.getTime() <= Date.now()) {
      setActionError('A data e hora do agendamento devem ser futuras.');
      return;
    }

    setIsSaving(true);
    setActionError(null);
    try {
      const updated = await scheduledPixService.update(editing.id, {
        valor: value,
        scheduledAt: localDate.toISOString(),
        descricao: description.trim() || null,
      });
      setSchedules((current) => current.map((item) => item.id === updated.id ? updated : item));
      setEditing(null);
    } catch (saveError) {
      setActionError(getApiErrorMessage(saveError, 'Não foi possível atualizar o agendamento.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function cancelSchedule() {
    if (!cancelling) return;
    setIsSaving(true);
    setActionError(null);
    try {
      await scheduledPixService.cancel(cancelling.id);
      setSchedules((current) => current.filter((item) => item.id !== cancelling.id));
      setCancelling(null);
    } catch (cancelError) {
      setActionError(getApiErrorMessage(cancelError, 'Não foi possível cancelar o agendamento.'));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return null;

  return (
    <>
      {loadError && (
        <div className="mx-4 mt-4 rounded-xl border border-text-negative/30 bg-bg-input p-4" role="alert">
          <p className="text-sm text-text-negative">{loadError}</p>
          <Button className="mt-2" size="sm" variant="outline" onClick={() => void loadSchedules()}>Tentar novamente</Button>
        </div>
      )}

      {schedules.length > 0 && (
        <section className="mx-4 my-4 rounded-2xl border border-brand-element/40 bg-bg-input p-4" aria-labelledby="scheduled-pix-title">
          <h2 id="scheduled-pix-title" className="text-lg font-semibold text-text">
            Você possui {schedules.length} Pix agendado{schedules.length === 1 ? '' : 's'}
          </h2>
          <p className="mt-1 text-sm text-text-secondary">Gerencie seus próximos pagamentos.</p>
          <ul className="mt-4 flex flex-col gap-3">
            {schedules.map((schedule) => (
              <li key={schedule.id} className="rounded-xl border border-bg-input bg-bg p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text">{formatCurrency(schedule.valor)}</p>
                    <p className="mt-1 text-sm text-text-secondary">Para {schedule.nomeDestinatario || schedule.chavePix}</p>
                    <p className="mt-1 text-sm text-text-secondary">
                      Previsto para {new Date(schedule.scheduledAt).toLocaleString('pt-BR')}
                    </p>
                    {schedule.descricao && <p className="mt-1 text-sm text-text-secondary">{schedule.descricao}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditor(schedule)}>Editar</Button>
                    <Button size="sm" variant="destructive" onClick={() => { setActionError(null); setCancelling(schedule); }}>Cancelar</Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {editing && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" role="presentation">
          <form
            onSubmit={(event) => void saveSchedule(event)}
            className="w-full max-w-md rounded-2xl bg-bg p-5 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-scheduled-pix-title"
          >
            <h2 id="edit-scheduled-pix-title" className="text-lg font-semibold text-text">Editar Pix agendado</h2>
            <p className="mt-1 text-sm text-text-secondary">Destinatário: {editing.nomeDestinatario || editing.chavePix}</p>
            {actionError && <p className="mt-3 text-sm text-text-negative" role="alert">{actionError}</p>}
            <div className="mt-4">
              <Label htmlFor="scheduled-pix-amount" className="mb-1.5 block">Valor (R$)</Label>
              <Input id="scheduled-pix-amount" type="number" min="0.01" step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} />
            </div>
            <div className="mt-3">
              <Label htmlFor="scheduled-pix-date" className="mb-1.5 block">Data e hora</Label>
              <Input id="scheduled-pix-date" type="datetime-local" min={toLocalDateTime(new Date().toISOString())} required value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} />
            </div>
            <div className="mt-3">
              <Label htmlFor="scheduled-pix-description" className="mb-1.5 block">Descrição (opcional)</Label>
              <Input id="scheduled-pix-description" maxLength={100} value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button type="button" variant="outline" disabled={isSaving} onClick={() => setEditing(null)}>Voltar</Button>
              <Button type="submit" disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar alterações'}</Button>
            </div>
          </form>
        </div>
      )}

      {cancelling && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" role="presentation">
          <div className="w-full max-w-md rounded-2xl bg-bg p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="cancel-scheduled-pix-title">
            <h2 id="cancel-scheduled-pix-title" className="text-lg font-semibold text-text">Cancelar Pix agendado?</h2>
            <p className="mt-2 text-sm text-text-secondary">
              O Pix de {formatCurrency(cancelling.valor)} para {cancelling.nomeDestinatario || cancelling.chavePix} não será processado.
            </p>
            {actionError && <p className="mt-3 text-sm text-text-negative" role="alert">{actionError}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" disabled={isSaving} onClick={() => setCancelling(null)}>Manter agendamento</Button>
              <Button variant="destructive" disabled={isSaving} onClick={() => void cancelSchedule()}>{isSaving ? 'Cancelando...' : 'Confirmar cancelamento'}</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
