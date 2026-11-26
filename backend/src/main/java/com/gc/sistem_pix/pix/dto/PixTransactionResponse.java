package com.gc.sistem_pix.pix.dto;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import com.gc.sistem_pix.pix.enums.PixKeyType;
public record PixTransactionResponse(UUID idTransacao, UUID contaOrigemId, UUID contaDestinoId,
        String descricao, BigDecimal valor, LocalDateTime dataHora, String chavePix, PixKeyType tipoChave,
        String nomeDestinatario, String documentoDestinatarioMascarado, PixLocationResponse location) {
    public PixTransactionResponse(
            UUID idTransacao,
            UUID contaOrigemId,
            UUID contaDestinoId,
            String descricao,
            BigDecimal valor,
            LocalDateTime dataHora,
            String chavePix,
            PixKeyType tipoChave,
            String nomeDestinatario,
            String documentoDestinatarioMascarado) {
        this(idTransacao, contaOrigemId, contaDestinoId, descricao, valor, dataHora, chavePix,
                tipoChave, nomeDestinatario, documentoDestinatarioMascarado, null);
    }
}
