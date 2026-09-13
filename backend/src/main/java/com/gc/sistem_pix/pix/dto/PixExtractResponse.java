package com.gc.sistem_pix.pix.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PixExtractResponse(
        LocalDateTime periodoInicio,
        LocalDateTime periodoFim,
        BigDecimal totalEntradas,
        BigDecimal totalSaidas,
        List<PixExtractItemResponse> transacoes) {
}