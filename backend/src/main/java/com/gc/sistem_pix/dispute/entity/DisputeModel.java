package com.gc.sistem_pix.dispute.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.gc.sistem_pix.account.entity.AccountModel;
import com.gc.sistem_pix.dispute.enums.DisputeResolvedBy;
import com.gc.sistem_pix.dispute.enums.DisputeStatus;
import com.gc.sistem_pix.pix.entity.PixTransaction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "disputa_pix")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisputeModel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_disputa", nullable = false, updatable = false)
    private UUID idDisputa;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_transacao", nullable = false, unique = true)
    private PixTransaction transacao;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_conta_solicitante", nullable = false)
    private AccountModel contaSolicitante;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_conta_destino", nullable = false)
    private AccountModel contaDestino;

    @Column(name = "valor", nullable = false, precision = 19, scale = 2)
    private BigDecimal valor;

    @Column(name = "motivo_abertura", nullable = false, length = 500)
    private String motivoAbertura;

    @Column(name = "justificativa_recebedor", length = 1000)
    private String justificativaRecebedor;

    @Column(name = "justificativa_admin", length = 1000)
    private String justificativaAdmin;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private DisputeStatus status = DisputeStatus.ABERTA;

    @Enumerated(EnumType.STRING)
    @Column(name = "resolvido_por", length = 30)
    private DisputeResolvedBy resolvidoPor;

    @Column(name = "resolvido_em")
    private LocalDateTime resolvidoEm;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em", nullable = false)
    private LocalDateTime atualizadoEm;
}
