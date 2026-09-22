package com.gc.sistem_pix.account.entity;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.gc.sistem_pix.account.enums.AccountStatus;
import com.gc.sistem_pix.account.enums.AccountType;
import com.gc.sistem_pix.account.exception.InsufficientBalanceException;
import com.gc.sistem_pix.user.entity.UserModel;

class AccountModelTest {

    private AccountModel account;

    @BeforeEach
    void setUp() {
        account = AccountModel.builder()
                .user(UserModel.builder().name("Teste").build())
                .status(AccountStatus.DESBLOQUEADA)
                .type(AccountType.PESSOA_FISICA)
                .build();
    }

    @Test
    @DisplayName("Deve calcular saldo disponível corretamente quando não há retenção")
    void deveCalcularSaldoDisponivelSemRetencao() {
        account.credit(new BigDecimal("1000.00"));

        assertEquals(0, account.getBalance().compareTo(new BigDecimal("1000.00")));
        assertEquals(0, account.getBlockedBalance().compareTo(BigDecimal.ZERO));
        assertEquals(0, account.getAvailableBalance().compareTo(new BigDecimal("1000.00")));
    }

    @Test
    @DisplayName("Deve reter saldo cautelar e abater do saldo disponível")
    void deveReterSaldoCautelarParaDisputa() {
        account.credit(new BigDecimal("5000.00"));
        account.blockBalanceForDispute(new BigDecimal("2000.00"));

        assertEquals(new BigDecimal("5000.00"), account.getBalance());
        assertEquals(new BigDecimal("2000.00"), account.getBlockedBalance());
        assertEquals(new BigDecimal("3000.00"), account.getAvailableBalance());
    }

    @Test
    @DisplayName("Não deve permitir gastar valor retido em disputa mesmo que saldo total seja positivo")
    void naoDevePermitirGastarValorRetidoEmDisputa() {
        // Exemplo da regra 6 do usuário:
        // Recebeu 2000 e tinha 5000 total. Bloqueia 2000.
        account.credit(new BigDecimal("5000.00"));
        account.blockBalanceForDispute(new BigDecimal("2000.00"));

        // Pode gastar até 3000
        account.debit(new BigDecimal("3000.00"));
        assertEquals(0, account.getBalance().compareTo(new BigDecimal("2000.00")));
        assertEquals(0, account.getAvailableBalance().compareTo(BigDecimal.ZERO));

        // Tentativa de gastar mais 1 real deve falhar com InsufficientBalanceException
        assertThrows(InsufficientBalanceException.class, () -> account.debit(new BigDecimal("1.00")));
    }

    @Test
    @DisplayName("Deve falhar ao tentar bloquear mais saldo do que o disponível")
    void deveFalharAoBloquearMaisSaldoDoQueDisponivel() {
        account.credit(new BigDecimal("1000.00"));

        assertThrows(InsufficientBalanceException.class, () ->
                account.blockBalanceForDispute(new BigDecimal("1500.00")));
    }

    @Test
    @DisplayName("Deve desbloquear saldo retido corretamente")
    void deveDesbloquearSaldoRetido() {
        account.credit(new BigDecimal("2000.00"));
        account.blockBalanceForDispute(new BigDecimal("500.00"));
        assertEquals(0, account.getAvailableBalance().compareTo(new BigDecimal("1500.00")));

        account.unblockBalanceFromDispute(new BigDecimal("500.00"));
        assertEquals(0, account.getBlockedBalance().compareTo(BigDecimal.ZERO));
        assertEquals(0, account.getAvailableBalance().compareTo(new BigDecimal("2000.00")));
    }

    @Test
    @DisplayName("Deve executar estorno de disputa debitando saldo e liberando bloqueio")
    void deveExecutarEstornoDeDisputa() {
        account.credit(new BigDecimal("2000.00"));
        account.blockBalanceForDispute(new BigDecimal("500.00"));

        account.executeDisputeRefund(new BigDecimal("500.00"));

        assertEquals(0, account.getBalance().compareTo(new BigDecimal("1500.00")));
        assertEquals(0, account.getBlockedBalance().compareTo(BigDecimal.ZERO));
        assertEquals(0, account.getAvailableBalance().compareTo(new BigDecimal("1500.00")));
    }
}
