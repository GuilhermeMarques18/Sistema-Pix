package com.gc.sistem_pix.dispute.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContestDisputeRequest(
        @NotBlank(message = "A justificativa é obrigatória")
        @Size(min = 5, max = 1000, message = "A justificativa deve ter entre 5 e 1000 caracteres")
        String justificativa
) {}
