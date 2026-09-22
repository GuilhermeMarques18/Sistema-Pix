package com.gc.sistem_pix.dispute.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ResolveDisputeAdminRequest(
        @NotNull(message = "A decisão de aprovação ou recusa é obrigatória")
        Boolean aprovado,

        @Size(max = 1000, message = "A justificativa deve ter no máximo 1000 caracteres")
        String justificativa
) {}
