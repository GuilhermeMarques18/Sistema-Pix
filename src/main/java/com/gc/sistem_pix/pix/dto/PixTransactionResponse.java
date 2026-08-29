package com.gc.sistem_pix.pix.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PixTransactionResponse(
        UUID idTransacao,
        UUID contaOrigemId,
        UUID contaDestinoId,
        String descricao,
        BigDecimal valor,
        LocalDateTime dataHora
        // Boolean transacaoEstornada,
        // Boolean transacaoAgendada,
        // String localTransacao
        ) {

}
