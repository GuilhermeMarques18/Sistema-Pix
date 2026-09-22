package com.gc.sistem_pix.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(
        @Schema(description = "E-mail cadastrado", example = "usuario@email.com")
        @NotBlank String email,

        @Schema(description = "Senha do usuário", example = "Senha@123", format = "password")
        @NotBlank String password
) {
}
