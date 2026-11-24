'use client';

import { useState } from 'react';
import { CheckCircle, LockKey, Users, ArrowsClockwise, ShieldStar, ArrowsLeftRight, ArrowLineUp, ArrowLineDown } from '@phosphor-icons/react';
import { useAdminAccounts } from '../hooks/useAdminAccounts';
import { useAdminUsers } from '../hooks/useAdminUsers';
import { useAdminTransactions } from '../hooks/useAdminTransactions';
import type { AdminAccount } from '../services/admin.service';

type Tab = 'pendentes' | 'contas' | 'usuarios' | 'transacoes';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function StatusBadge({ status }: { status: AdminAccount['status'] }) {
  const isPending = status === 'BLOQUEADA';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium
        ${isPending
          ? 'bg-text-warning/10 text-text-warning'
          : 'bg-brand-element/10 text-brand-element'
        }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isPending ? 'bg-text-warning' : 'bg-brand-element'}`} />
      {isPending ? 'Aguardando aprovação' : 'Ativa'}
    </span>
  );
}

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pendentes');
  const {
    pending,
    active,
    accounts,
    isLoading: loadingAccounts,
    error: errorAccounts,
    actionLoadingId: accountActionId,
    approveAccount,
    blockAccount,
    refetch: refetchAccounts,
  } = useAdminAccounts();

  const {
    users,
    isLoading: loadingUsers,
    error: errorUsers,
    actionLoadingId: userActionId,
    updateRole,
    refetch: refetchUsers,
  } = useAdminUsers();

  const {
    transactions,
    isLoading: loadingTransactions,
    error: errorTransactions,
    refetch: refetchTransactions,
  } = useAdminTransactions();

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'pendentes', label: 'Aprovações', count: pending.length },
    { id: 'contas', label: 'Contas', count: accounts.length },
    { id: 'usuarios', label: 'Usuários', count: users.length },
    { id: 'transacoes', label: 'Transações', count: transactions.length },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="border-b border-bg-input px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-element/10">
              <ShieldStar size={22} className="text-brand-element" weight="fill" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-text">Painel Administrativo</h1>
              <p className="text-sm text-text-secondary">Gestão de contas e usuários</p>
            </div>
          </div>
          <button
            onClick={() => { refetchAccounts(); refetchUsers(); refetchTransactions(); }}
            className="flex items-center gap-2 rounded-lg border border-bg-input px-3 py-2 text-sm text-text-secondary
              hover:bg-bg-input transition-colors"
            title="Atualizar"
          >
            <ArrowsClockwise size={16} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        </div>

        {/* Resumo */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-bg-input p-4">
            <p className="text-xs text-text-secondary mb-1">Pendentes</p>
            <p className="text-2xl font-bold text-text-warning">{pending.length}</p>
          </div>
          <div className="rounded-xl bg-bg-input p-4">
            <p className="text-xs text-text-secondary mb-1">Contas ativas</p>
            <p className="text-2xl font-bold text-brand-element">{active.length}</p>
          </div>
          <div className="rounded-xl bg-bg-input p-4">
            <p className="text-xs text-text-secondary mb-1">Usuários</p>
            <p className="text-2xl font-bold text-text">{users.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-bg-input px-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors
              ${activeTab === tab.id
                ? 'border-brand-element text-brand-element'
                : 'border-transparent text-text-secondary hover:text-text'
              }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-semibold
                  ${activeTab === tab.id ? 'bg-brand-element/20 text-brand-element' : 'bg-bg-input text-text-secondary'}`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="px-6 py-6">

        {/* ── Aba: Aprovações ── */}
        {activeTab === 'pendentes' && (
          <div>
            {loadingAccounts && (
              <p className="text-sm text-text-secondary text-center py-12">Carregando...</p>
            )}
            {errorAccounts && (
              <p className="text-sm text-text-negative text-center py-12">{errorAccounts}</p>
            )}
            {!loadingAccounts && pending.length === 0 && (
              <div className="flex flex-col items-center py-16 gap-3">
                <CheckCircle size={48} className="text-brand-element" weight="fill" />
                <p className="text-text font-medium">Nenhuma conta pendente</p>
                <p className="text-sm text-text-secondary">Todas as contas foram aprovadas.</p>
              </div>
            )}
            <div className="flex flex-col gap-3">
              {pending.map((account) => (
                <div key={account.id} className="rounded-xl bg-bg-input p-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-text-warning/10">
                    <span className="text-base font-bold text-text-warning">
                      {account.ownerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text truncate">{account.ownerName}</p>
                    <p className="text-xs text-text-secondary">
                      {account.type === 'PESSOA_FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica'} · Cadastro em {formatDate(account.createdAccount)}
                    </p>
                  </div>
                  <StatusBadge status={account.status} />
                  <button
                    onClick={() => approveAccount(account.id)}
                    disabled={accountActionId === account.id}
                    className="flex items-center gap-1.5 rounded-lg bg-brand-element px-4 py-2 text-sm font-semibold text-white
                      hover:bg-brand-logo transition-colors disabled:opacity-50 shrink-0"
                  >
                    <CheckCircle size={16} weight="fill" />
                    {accountActionId === account.id ? 'Aprovando...' : 'Aprovar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Aba: Contas ── */}
        {activeTab === 'contas' && (
          <div>
            {loadingAccounts && (
              <p className="text-sm text-text-secondary text-center py-12">Carregando...</p>
            )}
            {errorAccounts && (
              <p className="text-sm text-text-negative text-center py-12">{errorAccounts}</p>
            )}
            <div className="flex flex-col gap-3">
              {accounts.map((account) => (
                <div key={account.id} className="rounded-xl bg-bg-input p-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg">
                    <span className="text-base font-bold text-text-secondary">
                      {account.ownerName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text truncate">{account.ownerName}</p>
                    <p className="text-xs text-text-secondary">
                      {account.type === 'PESSOA_FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica'} · Criada em {formatDate(account.createdAccount)}
                    </p>
                  </div>
                  <StatusBadge status={account.status} />
                  {account.status === 'DESBLOQUEADA' ? (
                    <button
                      onClick={() => blockAccount(account.id)}
                      disabled={accountActionId === account.id}
                      className="flex items-center gap-1.5 rounded-lg border border-text-negative/40 px-3 py-2 text-sm
                        font-medium text-text-negative hover:bg-text-negative/10 transition-colors disabled:opacity-50 shrink-0"
                    >
                      <LockKey size={16} weight="fill" />
                      {accountActionId === account.id ? 'Bloqueando...' : 'Bloquear'}
                    </button>
                  ) : (
                    <button
                      onClick={() => approveAccount(account.id)}
                      disabled={accountActionId === account.id}
                      className="flex items-center gap-1.5 rounded-lg bg-brand-element px-3 py-2 text-sm
                        font-semibold text-white hover:bg-brand-logo transition-colors disabled:opacity-50 shrink-0"
                    >
                      <CheckCircle size={16} weight="fill" />
                      {accountActionId === account.id ? 'Aprovando...' : 'Aprovar'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Aba: Usuários ── */}
        {activeTab === 'usuarios' && (
          <div>
            {loadingUsers && (
              <p className="text-sm text-text-secondary text-center py-12">Carregando...</p>
            )}
            {errorUsers && (
              <p className="text-sm text-text-negative text-center py-12">{errorUsers}</p>
            )}
            <div className="flex flex-col gap-3">
              {users.map((user) => (
                <div key={user.id} className="rounded-xl bg-bg-input p-4 flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bg">
                    <Users size={18} className="text-text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text truncate">{user.name}</p>
                    <p className="text-xs text-text-secondary truncate">{user.email}</p>
                  </div>
                  <span
                    className={`hidden sm:inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                      ${user.role === 'ADMIN' ? 'bg-brand-logo/10 text-brand-logo'
                        : user.role === 'OWNER' ? 'bg-text-warning/10 text-text-warning'
                        : 'bg-bg text-text-secondary'}`}
                  >
                    {user.role}
                  </span>
                  {user.role !== 'OWNER' && (
                    <select
                      value={user.role}
                      disabled={userActionId === user.id}
                      onChange={(e) => updateRole(user.id, e.target.value as 'USER' | 'ADMIN')}
                      className="rounded-lg border border-bg-input bg-bg px-2 py-1.5 text-sm text-text
                        focus:outline-none focus:ring-1 focus:ring-brand-element disabled:opacity-50 shrink-0"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Aba: Transações ── */}
        {activeTab === 'transacoes' && (
          <div>
            {loadingTransactions && (
              <p className="text-sm text-text-secondary text-center py-12">Carregando...</p>
            )}
            {errorTransactions && (
              <p className="text-sm text-text-negative text-center py-12">{errorTransactions}</p>
            )}
            {!loadingTransactions && transactions.length === 0 && (
              <div className="flex flex-col items-center py-16 gap-3">
                <ArrowsLeftRight size={48} className="text-text-secondary" weight="thin" />
                <p className="text-text font-medium">Nenhuma transação encontrada</p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {transactions.map((tx) => {
                const isCredit = !tx.contaOrigemId;
                const date = new Date(tx.dataHora);
                return (
                  <div key={tx.idTransacao} className="rounded-xl bg-bg-input px-4 py-3 flex items-center gap-3">
                    {/* Ícone */}
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                      ${isCredit ? 'text-brand-element' : 'text-text-negative'}`}>
                      {isCredit
                        ? <ArrowLineDown size={20} weight="bold" />
                        : <ArrowLineUp size={20} weight="bold" />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">
                        {tx.nomeDestinatario || tx.descricao || (isCredit ? 'Pix recebido' : 'Pix enviado')}
                      </p>
                      <p className="text-xs text-text-secondary truncate">
                        {tx.chavePix ?? tx.contaDestinoId.slice(0, 8) + '...'}
                        {' · '}
                        {date.toLocaleDateString('pt-BR')} {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Valor */}
                    <p className={`text-sm font-semibold shrink-0 ${isCredit ? 'text-brand-element' : 'text-text-negative'}`}>
                      {isCredit ? '+ ' : '- '}
                      {tx.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
