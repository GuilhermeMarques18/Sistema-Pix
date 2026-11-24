package com.gc.sistem_pix.pix.dto;

import com.gc.sistem_pix.pix.enums.PixKeyType;
import com.gc.sistem_pix.pix.enums.PixKeyStatus;

import java.util.UUID;

public record PixKeyValidationResponse(
        boolean valida,
        boolean cadastrada,
        PixKeyType tipo,
        String chave,
        UUID contaDestinoId,
        PixKeyStatus status
) {
}
