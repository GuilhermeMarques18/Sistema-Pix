package com.gc.sistem_pix.pix.dto;

import java.math.BigDecimal;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record PixTransactionRequest(
        @NotNull
        UUID contaOrigemId,
        @NotNull
        UUID contaDestinoId,
        @NotNull
        @Positive
        BigDecimal valor,
        @Size(max = 255)
        String descricao
        // @NotNull
        // Boolean transacaoAgendada
        ) {

}
