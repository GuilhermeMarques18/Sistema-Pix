package com.gc.sistem_pix.account.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record AccountUnblockRequestDTO(
        @Schema(description = "Senha de login do titular da conta", example = "Senha@123", format = "password")
        @NotBlank(message = "A senha de login é obrigatória")
        String password,

        @Schema(description = "Confirmação da senha de login", example = "Senha@123", format = "password")
        @NotBlank(message = "A confirmação da senha é obrigatória")
        String confirmPassword
) {
}
