package com.gc.sistem_pix.pix.dto;

import com.gc.sistem_pix.pix.enums.PixKeyType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreatePixKeyRequest(
        @Schema(description = "Tipo da chave Pix", example = "EMAIL")
        @NotNull PixKeyType tipo,

        @Schema(
                description = "Valor da chave. Para ALEATORIO, deixe nulo ou vazio",
                example = "usuario@email.com"
        )
        @Size(max = 77)
        String chave
) {
}
