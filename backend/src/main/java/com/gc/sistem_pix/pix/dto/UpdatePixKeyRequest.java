package com.gc.sistem_pix.pix.dto;

import com.gc.sistem_pix.pix.enums.PixKeyType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdatePixKeyRequest(
        @Schema(description = "Tipo atual da chave Pix: EMAIL, CELULAR ou ALEATORIO, preservado na alteração", example = "EMAIL")
        @NotNull(message = "Tipo da chave Pix é obrigatório")
        PixKeyType tipo,

        @Schema(description = "Novo valor para EMAIL ou CELULAR. Para ALEATORIO, omita o campo; o servidor gera a chave", example = "novo@email.com")
        @Size(max = 77, message = "Chave Pix deve possuir no máximo 77 caracteres")
        String chave
) {
}
