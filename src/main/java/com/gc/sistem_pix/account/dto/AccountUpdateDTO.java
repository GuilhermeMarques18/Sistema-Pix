package com.gc.sistem_pix.account.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record AccountUpdateDTO(

        @NotNull(message = "Limite de transações é obrigatório")
        @DecimalMin(
                value = "0.0",
                inclusive = true,
                message = "Limite de transações não pode ser negativo"
        )
        BigDecimal transactionLimit

) {
}