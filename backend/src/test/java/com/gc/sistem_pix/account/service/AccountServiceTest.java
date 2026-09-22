package com.gc.sistem_pix.account.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.gc.sistem_pix.account.dto.AccountResponseDTO;
import com.gc.sistem_pix.account.dto.AccountUnblockRequestDTO;
import com.gc.sistem_pix.account.dto.AccountUpdateDTO;
import com.gc.sistem_pix.account.entity.AccountModel;
import com.gc.sistem_pix.account.enums.AccountStatus;
import com.gc.sistem_pix.account.enums.AccountType;
import com.gc.sistem_pix.account.repository.AccountRepository;
import com.gc.sistem_pix.user.entity.PessoaFisicaModel;
import com.gc.sistem_pix.user.entity.UserModel;
import com.gc.sistem_pix.user.repository.PessoaFisicaRepository;
import com.gc.sistem_pix.user.repository.PessoaJuridicaRepository;
import com.gc.sistem_pix.user.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PessoaFisicaRepository pessoaFisicaRepository;

    @Mock
    private PessoaJuridicaRepository pessoaJuridicaRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AccountService accountService;

    @Test
    void deveCriarContaPadraoComLimitesPadrao() {
        UUID userId = UUID.randomUUID();
        UserModel user = UserModel.builder().id(userId).name("Maria Silva").build();

        when(accountRepository.existsByUserId(userId)).thenReturn(false);
        when(pessoaFisicaRepository.findByUserId(userId))
                .thenReturn(Optional.of(new PessoaFisicaModel()));
        when(accountRepository.save(any(AccountModel.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        AccountResponseDTO response = accountService.createDefaultAccount(user);

        assertEquals(AccountStatus.DESBLOQUEADA, response.status());
        assertEquals(AccountType.PESSOA_FISICA, response.type());
        assertEquals(10, response.transactionLimit());
        assertEquals(1000, response.pixLimit());
    }

    @Test
    void deveBloquearContaPorSuspeitaDeFraude() {
        UUID accountId = UUID.randomUUID();
        UserModel user = UserModel.builder().id(UUID.randomUUID()).name("Joao Santos").build();
        AccountModel account = AccountModel.builder()
                .id(accountId)
                .user(user)
                .status(AccountStatus.DESBLOQUEADA)
                .build();

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));
        when(accountRepository.save(any(AccountModel.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        AccountResponseDTO response = accountService.blockAccount(accountId);

        assertEquals(AccountStatus.BLOQUEADA, response.status());
        verify(accountRepository).save(account);
    }

    @Test
    void deveDesbloquearContaPreviamenteBloqueada() {
        UUID accountId = UUID.randomUUID();
        UserModel user = UserModel.builder().id(UUID.randomUUID()).name("Joao Santos").build();
        AccountModel account = AccountModel.builder()
                .id(accountId)
                .user(user)
                .status(AccountStatus.BLOQUEADA)
                .build();

        when(accountRepository.findById(accountId)).thenReturn(Optional.of(account));
        when(accountRepository.save(any(AccountModel.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        AccountResponseDTO response = accountService.unblockAccount(accountId);

        assertEquals(AccountStatus.DESBLOQUEADA, response.status());
        verify(accountRepository).save(account);
    }

    @Test
    void deveAtualizarLimitesDaConta() {
        UUID userId = UUID.randomUUID();
        UserModel user = UserModel.builder().id(userId).name("Carlos Lima").build();
        AccountModel account = AccountModel.builder()
                .id(UUID.randomUUID())
                .user(user)
                .transactionLimit(10)
                .pixLimit(1000)
                .build();

        AccountUpdateDTO updateDTO = new AccountUpdateDTO(20, 5000);

        when(accountRepository.findByUserId(userId)).thenReturn(Optional.of(account));
        when(accountRepository.save(any(AccountModel.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        AccountResponseDTO response = accountService.updateOwn(userId, updateDTO);

        assertEquals(20, response.transactionLimit());
        assertEquals(5000, response.pixLimit());
        verify(accountRepository).save(account);
    }

    @Test
    void deveDesbloquearPropriaContaComSenhaCorreta() {
        UUID userId = UUID.randomUUID();
        UserModel user = UserModel.builder().id(userId).password("hash_senha").build();
        AccountModel account = AccountModel.builder()
                .id(UUID.randomUUID())
                .user(user)
                .status(AccountStatus.BLOQUEADA)
                .build();

        when(accountRepository.findByUserId(userId)).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("Senha@123", "hash_senha")).thenReturn(true);
        when(accountRepository.save(any(AccountModel.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        AccountUnblockRequestDTO request = new AccountUnblockRequestDTO("Senha@123", "Senha@123");
        AccountResponseDTO response = accountService.unblockOwn(userId, request);

        assertEquals(AccountStatus.DESBLOQUEADA, response.status());
        verify(accountRepository).save(account);
    }

    @Test
    void deveLancarExcecaoAoDesbloquearComConfirmacaoDeSenhaDivergente() {
        UUID userId = UUID.randomUUID();
        AccountUnblockRequestDTO request = new AccountUnblockRequestDTO("Senha@123", "Outra@123");

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> accountService.unblockOwn(userId, request));

        assertEquals("A confirmação da senha não confere com a senha informada", exception.getMessage());
    }

    @Test
    void deveLancarExcecaoAoDesbloquearComSenhaIncorreta() {
        UUID userId = UUID.randomUUID();
        UserModel user = UserModel.builder().id(userId).password("hash_senha").build();
        AccountModel account = AccountModel.builder()
                .id(UUID.randomUUID())
                .user(user)
                .status(AccountStatus.BLOQUEADA)
                .build();

        when(accountRepository.findByUserId(userId)).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("Errada@123", "hash_senha")).thenReturn(false);

        AccountUnblockRequestDTO request = new AccountUnblockRequestDTO("Errada@123", "Errada@123");

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> accountService.unblockOwn(userId, request));

        assertEquals("Senha de login incorreta", exception.getMessage());
    }
}
