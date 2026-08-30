package com.gc.sistem_pix.account.dto;

import java.util.UUID;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record AccountRequestDTO(
                @Schema(description = "ID do usuário que será associado à conta", example = "11111111-1111-1111-1111-111111111111") @NotNull(message = "Usuário é obrigatório") UUID userId) {
}
