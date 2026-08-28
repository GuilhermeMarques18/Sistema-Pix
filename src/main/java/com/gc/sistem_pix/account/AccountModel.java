package com.gc.sistem_pix.account;

import com.gc.sistem_pix.user.UserModel;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@SQLRestriction("ativo = true")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "accounts")
@Data
public class AccountModel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @NotNull(message = "Conta deve estar vinculada a um usuário")
    private UserModel user;

    @NotNull
    @Column(nullable = false, unique = true, length = 20)
    private String accountNumber;

    @NotNull
    @Column(nullable = false, length = 10)
    private String agency;

    @NotNull
    @Column(nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAccount;

    @Column(nullable = false)
    @Builder.Default
    private boolean ativo = true;

    private LocalDateTime deletedAt;
}