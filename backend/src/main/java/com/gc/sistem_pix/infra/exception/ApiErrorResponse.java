package com.gc.sistem_pix.infra.exception;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Resposta padrão de erro da API")
public record ApiErrorResponse(
        @Schema(example = "409")
        int status,

        @Schema(example = "Conflict")
        String error,

        @Schema(example = "E-mail já cadastrado")
        String message,

        @Schema(example = "/api/users/me")
        String path,

        LocalDateTime timestamp
) {
}
