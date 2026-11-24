package com.gc.sistem_pix.pix.dto;

import com.gc.sistem_pix.pix.enums.PixKeyStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record UpdatePixKeyStatusRequest(
        @NotNull @Schema(description = "ATIVA permite receber Pix; SUSPENSA mantém a chave reservada sem receber", example = "SUSPENSA") PixKeyStatus status) {
}
