package com.gc.sistem_pix.dispute.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.gc.sistem_pix.dispute.enums.DisputeResolvedBy;
import com.gc.sistem_pix.dispute.enums.DisputeStatus;

public record DisputeResponseDTO(
        UUID idDisputa,
        UUID idTransacao,
        UUID contaSolicitanteId,
        UUID contaDestinoId,
        BigDecimal valor,
        String motivoAbertura,
        String justificativaRecebedor,
        String justificativaAdmin,
        DisputeStatus status,
        DisputeResolvedBy resolvidoPor,
        LocalDateTime resolvidoEm,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm
) {}
