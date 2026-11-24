package com.gc.sistem_pix.pix.dto;

import com.gc.sistem_pix.pix.enums.PixKeyType;
import com.gc.sistem_pix.pix.enums.PixKeyStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record PixKeyResponse(
        UUID id,
        UUID contaBancariaId,
        PixKeyType tipo,
        String chave,
        LocalDateTime criadoEm,
        PixKeyStatus status
) {
}
