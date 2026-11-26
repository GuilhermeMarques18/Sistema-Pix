package com.gc.sistem_pix.pix.dto;

import com.gc.sistem_pix.pix.enums.PixKeyType;

import java.util.UUID;

public record PixContactResponse(
        UUID id,
        String nome,
        PixKeyType tipoChave,
        String chavePix
) {
}
