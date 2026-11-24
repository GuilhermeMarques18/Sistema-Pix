package com.gc.sistem_pix.pix.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import com.gc.sistem_pix.pix.enums.PixKeyType;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "transacao")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor

public class PixTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_transacao", nullable = false, updatable = false)
    private UUID idTransacao;

    @Column(name = "id_conta_origem", nullable = false, updatable = false)
    private UUID contaOrigemId;

    @Column(name = "id_conta_destino", nullable = false, updatable = false)
    private UUID contaDestinoId;

    @Column(name = "descricao", length = 100)
    private String descricao;

    @Column(name = "valor", nullable = false, precision = 19, scale = 2)
    private BigDecimal valor;

    @Column(name = "data_hora", nullable = false, updatable = false)
    private LocalDateTime dataHora;

    @Column(name = "idempotency_key", updatable = false)
    private UUID idempotencyKey;

    @Column(name = "request_fingerprint", length = 64, updatable = false)
    private String requestFingerprint;

    @Column(name = "chave_pix", length = 77, updatable = false)
    private String chavePix;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_chave", length = 20, updatable = false)
    private PixKeyType tipoChave;

    @Column(name = "nome_destinatario", length = 150, updatable = false)
    private String nomeDestinatario;

    @Column(name = "documento_destinatario_mascarado", length = 30, updatable = false)
    private String documentoDestinatarioMascarado;

    @Builder.Default
    @Column(name = "transacao_estornada", nullable = false)
    private boolean transacaoEstornada = false;
    // @Builder.Default
    // @Column(name = "transacao_agendada", nullable = false)
    // private boolean transacaoAgendada = false;
    // @Column(name = "local_transacao", length = 255)
    // private String localTransacao;
    @PrePersist
    protected void aoCriar() {
        dataHora = (dataHora == null ? LocalDateTime.now() : dataHora).truncatedTo(ChronoUnit.MICROS);
    }
}
