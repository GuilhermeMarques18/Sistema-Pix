package com.gc.sistem_pix.account.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.PositiveOrZero;

public record AccountUpdateDTO(
        @Schema(description = "Limite geral de transações diárias", example = "10")
        @PositiveOrZero(message = "Limite de transações não pode ser negativo")
        Integer transactionLimit,

        @Schema(description = "Limite de valor de transações Pix (em R$)", example = "1000")
        @PositiveOrZero(message = "Limite Pix não pode ser negativo")
        Integer pixLimit) {
}