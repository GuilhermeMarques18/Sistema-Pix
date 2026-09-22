package com.gc.sistem_pix.dispute.dto;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateDisputeRequest(
        @NotNull(message = "O ID da transação é obrigatório")
        UUID idTransacao,

        @NotBlank(message = "O motivo da abertura da disputa é obrigatório")
        @Size(min = 5, max = 500, message = "O motivo deve ter entre 5 e 500 caracteres")
        String motivo
) {}
