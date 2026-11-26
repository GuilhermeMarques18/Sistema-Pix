export interface ScheduledPix {
  id: string;
  contaDestinoId: string;
  chavePix: string;
  valor: number;
  descricao: string | null;
  scheduledAt: string;
  status: string;
  nomeDestinatario: string;
}

export interface UpdateScheduledPixPayload {
  valor: number;
  scheduledAt: string;
  descricao: string | null;
}
