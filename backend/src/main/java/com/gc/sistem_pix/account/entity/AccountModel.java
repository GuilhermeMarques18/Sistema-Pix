package com.gc.sistem_pix.account.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;

import com.gc.sistem_pix.account.enums.AccountStatus;
import com.gc.sistem_pix.account.enums.AccountType;
import com.gc.sistem_pix.account.exception.InsufficientBalanceException;
import com.gc.sistem_pix.user.entity.UserModel;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Setter;

@SQLRestriction("ativo = true")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "conta_bancaria")
@Data
public class AccountModel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_conta_bancaria", nullable = false, updatable = false)
    private UUID id;

    @OneToOne(fetch = jakarta.persistence.FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_usuario", nullable = false, unique = true)
    @NotNull(message = "Conta deve estar vinculada a um usuário")
    private UserModel user;

    @NotNull
    @Column(name = "saldo", nullable = false, precision = 19, scale = 2)
    @Builder.Default
    @Setter(AccessLevel.NONE)
    private BigDecimal balance = BigDecimal.ZERO;

    @NotNull
    @Column(name = "saldo_bloqueado", nullable = false, precision = 19, scale = 2)
    @Builder.Default
    @Setter(AccessLevel.NONE)
    private BigDecimal blockedBalance = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private AccountStatus status = AccountStatus.DESBLOQUEADA;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo", nullable = false, length = 20)
    private AccountType type;

    @NotNull
    @Column(name = "limite_transacoes", nullable = false)
    @Builder.Default
    private Integer transactionLimit = 10;

    @NotNull
    @Column(name = "limite_pix", nullable = false)
    @Builder.Default
    private Integer pixLimit = 1000;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime createdAccount;

    @Column(name = "ativo", nullable = false)
    @Builder.Default
    private boolean ativo = true;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public void block() {
        this.status = AccountStatus.BLOQUEADA;
    }

    public void unblock() {
        this.status = AccountStatus.DESBLOQUEADA;
    }

    public BigDecimal getAvailableBalance() {
        BigDecimal blocked = this.blockedBalance;
        BigDecimal total = this.balance;
        return total.subtract(blocked);
    }

    public void credit(BigDecimal value) {
        validatePositiveValue(value);
        this.balance = this.balance.add(value);
    }

    public void debit(BigDecimal value) {
        validatePositiveValue(value);

        if (getAvailableBalance().compareTo(value) < 0) {
            throw new InsufficientBalanceException(
                    "Saldo disponível insuficiente. Existem valores retidos sob disputa.");
        }

        this.balance = this.balance.subtract(value);
    }

    public void blockBalanceForDispute(BigDecimal value) {
        validatePositiveValue(value);
        if (getAvailableBalance().compareTo(value) < 0) {
            throw new InsufficientBalanceException("Saldo insuficiente na conta para abertura de disputa");
        }
        this.blockedBalance = BigDecimal.ZERO;
        this.blockedBalance = this.blockedBalance.add(value);
    }

    public void unblockBalanceFromDispute(BigDecimal value) {
        validatePositiveValue(value);
        if (this.blockedBalance.compareTo(value) < 0) {
            throw new IllegalStateException("Saldo bloqueado não pode ser menor que o valor a ser desbloqueado");
        }
        this.blockedBalance = this.blockedBalance.subtract(value);
    }

    public void executeDisputeRefund(BigDecimal value) {
        validatePositiveValue(value);
        unblockBalanceFromDispute(value);
        this.balance = this.balance.subtract(value);
    }

    public boolean isAvailableForPix() {
        return ativo && status == AccountStatus.DESBLOQUEADA;
    }

    private void validatePositiveValue(BigDecimal value) {
        if (value == null || value.signum() <= 0) {
            throw new IllegalArgumentException("Valor deve ser maior que zero");
        }
    }
}
