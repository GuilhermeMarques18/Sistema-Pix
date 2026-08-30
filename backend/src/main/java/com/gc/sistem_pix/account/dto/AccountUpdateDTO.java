package com.gc.sistem_pix.account.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.PositiveOrZero;

public record AccountUpdateDTO(
                @Schema(description = "Limite geral de transações", example = "100") @PositiveOrZero(message = "Limite de transações não pode ser negativo") Integer transactionLimit,

                @Schema(description = "Limite de transações Pix", example = "50") @PositiveOrZero(message = "Limite Pix não pode ser negativo") Integer pixLimit) {
}