package com.gc.sistem_pix.pix.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.gc.sistem_pix.pix.enums.TipoOperacaoPix;

public record PixExtractItemResponse(
        UUID idTransacao,
        LocalDateTime dataHora,
        TipoOperacaoPix tipo,
        BigDecimal valor,
        String descricao,
        UUID contaContraparteId,
        PixLocationResponse location) {
    public PixExtractItemResponse(
            UUID idTransacao,
            LocalDateTime dataHora,
            TipoOperacaoPix tipo,
            BigDecimal valor,
            String descricao,
            UUID contaContraparteId) {
        this(idTransacao, dataHora, tipo, valor, descricao, contaContraparteId, null);
    }
}