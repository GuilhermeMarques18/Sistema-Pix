package com.gc.sistem_pix.pix.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record PixTransactionRequest(
        @Schema(
                description = "Chave Pix da conta que receberá o valor",
                example = "destino@email.com"
        )
        @NotBlank(message = "Chave Pix de destino é obrigatória")
        @Size(max = 77, message = "Chave Pix deve possuir no máximo 77 caracteres")
        String chavePix,

        @Schema(description = "Valor da transação", example = "150.75")
        @NotNull @Positive BigDecimal valor,

        @Schema(description = "Descrição opcional da transação", example = "Pagamento de serviço")
        @Size(max = 100) String descricao

        // @NotNull
        // Boolean transacaoAgendada
) {
}
