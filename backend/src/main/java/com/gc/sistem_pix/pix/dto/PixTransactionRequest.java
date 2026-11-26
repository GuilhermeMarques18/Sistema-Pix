package com.gc.sistem_pix.pix.dto;
import java.math.BigDecimal;
import java.util.UUID;
import com.gc.sistem_pix.pix.enums.PixKeyType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import jakarta.validation.Valid;
public record PixTransactionRequest(
        @NotBlank @Size(max = 77) String chavePix,
        @NotNull @Positive @Digits(integer = 17, fraction = 2) BigDecimal valor,
        @Size(max = 100) String descricao,
        @NotNull PixKeyType tipoChave,
        @NotNull UUID contaDestinoId,
        @NotBlank @Size(max = 72) @Schema(accessMode = Schema.AccessMode.WRITE_ONLY, format = "password") String password,
        @NotNull UUID idempotencyKey,
        @Valid PixLocationDTO location) {
    public PixTransactionRequest(
            String chavePix,
            BigDecimal valor,
            String descricao,
            PixKeyType tipoChave,
            UUID contaDestinoId,
            String password,
            UUID idempotencyKey) {
        this(chavePix, valor, descricao, tipoChave, contaDestinoId, password, idempotencyKey, null);
    }

    public PixTransactionRequest {
        descricao = descricao == null || descricao.isBlank() ? null : descricao.trim();
    }
    @Override
    public String toString() {
        return "PixTransactionRequest[idempotencyKey=" + idempotencyKey + ", password=[REDACTED]]";
    }
}
