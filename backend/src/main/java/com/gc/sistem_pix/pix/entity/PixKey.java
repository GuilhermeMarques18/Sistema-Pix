package com.gc.sistem_pix.pix.entity;

import com.gc.sistem_pix.account.entity.AccountModel;
import com.gc.sistem_pix.pix.enums.PixKeyType;
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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "chave_pix",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_chave_pix_conta_tipo",
                columnNames = {"id_conta_bancaria", "tipo"}))
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PixKey {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_chave_pix", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_conta_bancaria", nullable = false)
    private AccountModel account;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 20)
    private PixKeyType type;

    @Column(name = "chave", nullable = false, unique = true, length = 77)
    private String key;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
