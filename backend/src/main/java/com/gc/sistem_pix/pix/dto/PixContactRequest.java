package com.gc.sistem_pix.pix.dto;

import com.gc.sistem_pix.pix.enums.PixKeyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PixContactRequest(
        @NotBlank @Size(min = 2, max = 80) String nome,
        @NotNull PixKeyType tipoChave,
        @NotBlank @Size(max = 77) String chavePix
) {
}
