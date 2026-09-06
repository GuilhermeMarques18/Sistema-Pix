'use client';

import { ArrowLineDown, ArrowLineUp } from '@phosphor-icons/react';
import type { PixTransactionResponse, AccountSummary } from '../types/extrato.types';

interface ExtratoTransactionItemProps {
  transaction: PixTransactionResponse;
  account: AccountSummary;
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDateTime(isoString: string): { date: string; time: string } {
  const date = new Date(isoString);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const dateLabel = isToday
    ? 'Hoje'
    : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return { date: dateLabel, time };
}

export function ExtratoTransactionItem({ transaction, account }: ExtratoTransactionItemProps) {
  const isCredit = transaction.contaDestinoId === account.id;
  const { date, time } = formatDateTime(transaction.dataHora);

  // A outra conta envolvida na transação
  const counterpartId = isCredit ? transaction.contaOrigemId : transaction.contaDestinoId;

  // Exibe o ID da conta contraparte de forma legível (últimos 8 chars do UUID)
  const counterpartLabel = counterpartId.replace(/-/g, '').slice(-11).replace(/(.{3})(.{3})(.{3})(.{2})/, '$1.$2.$3-$4');

  return (
    <div className="flex items-center gap-3 rounded-xl bg-bg-input px-4 py-3">
      {/* Icon */}
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full
          ${isCredit ? 'text-brand-element' : 'text-text-negative'}`}
      >
        {isCredit ? (
          <ArrowLineDown size={20} weight="bold" />
        ) : (
          <ArrowLineUp size={20} weight="bold" />
        )}
      </div>

      {/* Descrição + contraparte */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text truncate">
          {transaction.descricao ?? (isCredit ? 'Pix recebido' : 'Pix enviado')}
        </p>
        <p className="text-xs text-text-secondary truncate">{counterpartLabel}</p>
      </div>

      {/* Valor + data */}
      <div className="text-right flex-shrink-0">
        <p
          className={`text-sm font-semibold ${
            isCredit ? 'text-brand-element' : 'text-text-negative'
          }`}
        >
          {isCredit ? '+ ' : '- '}
          {formatBRL(transaction.valor)}
        </p>
        <p className="text-xs text-text-secondary">
          {date}, {time}
        </p>
      </div>
    </div>
  );
}
