import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/app/shared/components/ui/button';
import { Input } from '@/app/shared/components/ui/input';
import { PageHeader } from '@/app/shared/components/ui/page-header';
import { getApiErrorMessage } from '@/app/shared/lib/apiError';
import {
  activityHistoryService,
  type ActivityHistoryEvent,
  type HistoryCategory,
  type ActivityHistoryPage as HistoryPageData,
} from '../services/activityHistory.service';

const eventOptions: Record<HistoryCategory, Array<{ value: string; label: string }>> = {
  LOGIN: [
    { value: 'LOGIN_SUCCESS', label: 'Login realizado' },
    { value: 'LOGIN_FAILED', label: 'Login malsucedido' },
  ],
  ACTIVITY: [
    { value: 'USER_UPDATED', label: 'Dados da conta alterados' },
    { value: 'PIX_KEY_CREATED', label: 'Chave PIX cadastrada' },
    { value: 'PIX_KEY_UPDATED', label: 'Chave PIX alterada' },
    { value: 'PIX_KEY_STATUS_UPDATED', label: 'Status de chave alterado' },
    { value: 'PIX_SENT', label: 'PIX enviado' },
    { value: 'PIX_SCHEDULED_CREATED', label: 'PIX agendado' },
    { value: 'PIX_SCHEDULED_UPDATED', label: 'Agendamento alterado' },
    { value: 'PIX_SCHEDULED_CANCELLED', label: 'Agendamento cancelado' },
    { value: 'PIX_CONTACT_CREATED', label: 'Contato adicionado' },
    { value: 'PIX_CONTACT_UPDATED', label: 'Contato alterado' },
    { value: 'PIX_CONTACT_DELETED', label: 'Contato removido' },
  ],
};

function formatEventDate(value: string) {
  return new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

function eventLabel(event: ActivityHistoryEvent): string {
  return eventOptions[event.category].find((item) => item.value === event.eventType)?.label ?? event.eventType;
}

export function ActivityHistoryPage() {
  const [category, setCategory] = useState<HistoryCategory>('LOGIN');
  const [eventType, setEventType] = useState('');
  const [from, setFrom] = useState('');
  const [until, setUntil] = useState('');
  const [page, setPage] = useState<HistoryPageData | null>(null);
  const [pageNumber, setPageNumber] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setPage(await activityHistoryService.list({
        category,
        eventType,
        from,
        until,
        page: pageNumber,
        size: 20,
      }));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar o histórico.'));
    } finally {
      setIsLoading(false);
    }
  }, [category, eventType, from, until, pageNumber]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  function changeCategory(next: HistoryCategory) {
    setCategory(next);
    setEventType('');
    setPageNumber(0);
  }

  return (
    <div className="pb-6">
      <PageHeader title="Histórico de acessos e atividades" subtitle="Consulte acessos recentes e alterações na sua conta" />
      <div className="mt-6 flex flex-col gap-4 px-4">
        <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Tipo de histórico">
          <Button type="button" variant={category === 'LOGIN' ? 'default' : 'outline'} role="tab" aria-selected={category === 'LOGIN'} onClick={() => changeCategory('LOGIN')}>Logins</Button>
          <Button type="button" variant={category === 'ACTIVITY' ? 'default' : 'outline'} role="tab" aria-selected={category === 'ACTIVITY'} onClick={() => changeCategory('ACTIVITY')}>Atividades</Button>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <label htmlFor="history-event-type" className="flex flex-col gap-1 text-xs text-text-secondary">
            Tipo do evento
            <select
              id="history-event-type"
              value={eventType}
              onChange={(event) => { setEventType(event.target.value); setPageNumber(0); }}
              className="h-10 rounded-md border border-bg-input bg-bg-input px-3 text-sm text-text"
            >
              <option value="">Todos os eventos</option>
              {eventOptions[category].map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label htmlFor="history-from" className="flex flex-col gap-1 text-xs text-text-secondary">
            De
            <Input id="history-from" type="date" value={from} onChange={(event) => { setFrom(event.target.value); setPageNumber(0); }} />
          </label>
          <label htmlFor="history-until" className="flex flex-col gap-1 text-xs text-text-secondary">
            Até
            <Input id="history-until" type="date" value={until} onChange={(event) => { setUntil(event.target.value); setPageNumber(0); }} />
          </label>
        </div>

        {error && <div role="alert" className="flex flex-col gap-2 text-sm text-text-negative"><p>{error}</p><Button size="sm" variant="outline" onClick={() => void loadHistory()}>Tentar novamente</Button></div>}
        {isLoading && <p role="status" className="text-sm text-text-secondary">Carregando histórico...</p>}
        {!isLoading && !error && page?.content.length === 0 && (
          <p className="rounded-xl bg-bg-input/50 p-4 text-sm text-text-secondary">Nenhum evento encontrado para os filtros selecionados.</p>
        )}
        {!isLoading && !error && page && page.content.length > 0 && (
          <>
            <div className="flex flex-col gap-3">
              {page.content.map((event) => (
                <article key={event.id} className="rounded-xl border border-bg-input bg-bg p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-semibold text-text">{eventLabel(event)}</h2>
                      <p className="mt-1 text-xs text-text-secondary">{formatEventDate(event.createdAt)}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs ${event.status === 'SUCCESS' ? 'bg-brand-element/10 text-brand-element' : 'bg-text-negative/10 text-text-negative'}`}>
                      {event.status === 'SUCCESS' ? 'Concluído' : 'Falhou'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-text-secondary">{event.description}</p>
                  <dl className="mt-3 grid gap-1 text-xs text-text-secondary sm:grid-cols-2">
                    <div><dt className="inline font-medium">IP: </dt><dd className="inline">{event.ipAddress ?? 'Não disponível'}</dd></div>
                    <div><dt className="inline font-medium">Dispositivo: </dt><dd className="inline break-words">{event.userAgent ?? 'Não disponível'}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-text-secondary">{page.totalElements} evento(s)</p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={page.first} onClick={() => setPageNumber((current) => Math.max(0, current - 1))}>Anterior</Button>
                <span className="text-xs text-text-secondary">{page.totalPages === 0 ? 0 : page.number + 1} / {page.totalPages}</span>
                <Button size="sm" variant="outline" disabled={page.last} onClick={() => setPageNumber((current) => current + 1)}>Próxima</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
