package com.gc.sistem_pix.pix.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import com.gc.sistem_pix.pix.enums.PixKeyType;

public record ScheduledPixResponse(UUID id, UUID contaOrigemId, UUID contaDestinoId, String chavePix,
        PixKeyType tipoChave, BigDecimal valor, String descricao, Instant scheduledAt, String status,
        String nomeDestinatario,
        UUID transactionId, String failureReason) {}