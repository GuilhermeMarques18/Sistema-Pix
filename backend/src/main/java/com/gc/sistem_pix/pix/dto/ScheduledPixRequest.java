package com.gc.sistem_pix.pix.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import com.gc.sistem_pix.pix.enums.PixKeyType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import jakarta.validation.Valid;

public record ScheduledPixRequest(
        @NotBlank @Size(max = 77) String chavePix,
        @NotNull @Positive @Digits(integer = 17, fraction = 2) BigDecimal valor,
        @Size(max = 100) String descricao,
        @NotNull PixKeyType tipoChave,
        @NotNull UUID contaDestinoId,
        @NotBlank @Size(max = 72) @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, format = "password") String password,
        @NotNull UUID idempotencyKey,
        @NotNull OffsetDateTime scheduledAt,
        @Valid PixLocationDTO location) {
    public ScheduledPixRequest(
            String chavePix,
            BigDecimal valor,
            String descricao,
            PixKeyType tipoChave,
            UUID contaDestinoId,
            String password,
            UUID idempotencyKey,
            OffsetDateTime scheduledAt) {
        this(chavePix, valor, descricao, tipoChave, contaDestinoId, password, idempotencyKey, scheduledAt, null);
    }

    public PixTransactionRequest transactionRequest() {
        return new PixTransactionRequest(chavePix, valor, descricao, tipoChave, contaDestinoId, password, idempotencyKey, location);
    }
    @Override public String toString() { return "ScheduledPixRequest[idempotencyKey=" + idempotencyKey + ", password=[REDACTED]]"; }
}