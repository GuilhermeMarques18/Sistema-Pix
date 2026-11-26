package com.gc.sistem_pix.pix.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.gc.sistem_pix.pix.dto.PixRecipientResponse;
import com.gc.sistem_pix.pix.event.PixTransferCompletedEvent;

import com.gc.sistem_pix.account.entity.AccountModel;
import com.gc.sistem_pix.account.enums.AccountStatus;
import com.gc.sistem_pix.account.exception.AccountBlockedException;
import com.gc.sistem_pix.account.repository.AccountRepository;
import com.gc.sistem_pix.activity.service.UserActivityEventService;
import com.gc.sistem_pix.pix.dto.PixTransactionRequest;
import com.gc.sistem_pix.pix.dto.PixTransactionResponse;
import com.gc.sistem_pix.pix.dto.PixLocationDTO;
import com.gc.sistem_pix.pix.dto.PixLocationSource;
import com.gc.sistem_pix.pix.dto.PixExtractResponse;
import com.gc.sistem_pix.pix.entity.PixKey;
import com.gc.sistem_pix.pix.entity.PixLocationData;
import com.gc.sistem_pix.pix.entity.PixTransaction;
import com.gc.sistem_pix.pix.enums.PixKeyType;
import com.gc.sistem_pix.pix.exception.InvalidPixTransactionException;
import com.gc.sistem_pix.pix.repository.PixTransactionRepository;
import com.gc.sistem_pix.user.entity.UserModel;

@ExtendWith(MockitoExtension.class)
class PixTransactionServiceTest {

    @Mock
    private PixTransactionRepository pixTransactionRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private PixKeyService pixKeyService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private PixRecipientService recipientService;

    @Mock
    private ApplicationEventPublisher events;

    @Mock
    private UserActivityEventService activityEvents;

    @InjectMocks
    private PixTransactionService pixTransactionService;

    @Test
    void deveSalvarUmaTransacaoValidaERetornarResposta() {
        UUID usuarioId = UUID.randomUUID();
        UUID contaOrigemId = UUID.randomUUID();
        UUID contaDestinoId = UUID.randomUUID();
        UUID idTransacao = UUID.randomUUID();
        LocalDateTime dataHora = LocalDateTime.now();
        String chavePix = "destino@email.com";

        UserModel authenticatedUser = UserModel.builder().id(usuarioId).name("Usuario Origem").password("hash_senha").build();
        UserModel destinationUser = UserModel.builder().id(UUID.randomUUID()).name("Usuario Destino").build();
        PixLocationDTO location = new PixLocationDTO(
                new BigDecimal("-23.5505200"),
                new BigDecimal("-46.6333080"),
                new BigDecimal("14.5"),
                PixLocationSource.BROWSER);
        PixTransactionRequest request = new PixTransactionRequest(
                chavePix,
                new BigDecimal("100.50"),
                "Pagamento",
                PixKeyType.EMAIL,
                contaDestinoId,
                "Senha@123",
                UUID.randomUUID(),
                location);

        AccountModel originAccount = AccountModel.builder()
                .id(contaOrigemId)
                .user(authenticatedUser)
                .balance(new BigDecimal("200.00"))
                .status(AccountStatus.DESBLOQUEADA)
                .pixLimit(1000)
                .transactionLimit(10)
                .build();
        AccountModel destinationAccount = AccountModel.builder()
                .id(contaDestinoId)
                .user(destinationUser)
                .balance(new BigDecimal("50.00"))
                .status(AccountStatus.DESBLOQUEADA)
                .build();
        PixKey destinationKey = PixKey.builder()
                .account(destinationAccount)
                .type(PixKeyType.EMAIL)
                .key(chavePix)
                .build();

        when(passwordEncoder.matches("Senha@123", "hash_senha")).thenReturn(true);
        when(accountRepository.findAccountIdByUserId(usuarioId)).thenReturn(Optional.of(contaOrigemId));
        when(pixKeyService.findByKeyForTransferForUpdate(PixKeyType.EMAIL, chavePix)).thenReturn(destinationKey);
        when(accountRepository.findByIdForUpdate(contaOrigemId))
                .thenReturn(Optional.of(originAccount));
        when(accountRepository.findByIdForUpdate(contaDestinoId))
                .thenReturn(Optional.of(destinationAccount));
        when(pixTransactionRepository.countByContaOrigemIdAndDataHoraBetween(any(), any(), any()))
                .thenReturn(0L);

        PixTransaction savedTransaction = PixTransaction.builder()
                .idTransacao(idTransacao)
                .contaOrigemId(contaOrigemId)
                .contaDestinoId(contaDestinoId)
                .valor(request.valor())
                .descricao(request.descricao())
                .dataHora(dataHora)
                .location(PixLocationData.from(location))
                .build();

        when(recipientService.describe(destinationKey)).thenReturn(new PixRecipientResponse(
                PixKeyType.EMAIL, chavePix, contaDestinoId, "Usuario Destino", null));
        when(pixTransactionRepository.saveAndFlush(any(PixTransaction.class)))
                .thenReturn(savedTransaction);

        PixTransactionResponse response = pixTransactionService.create(request, authenticatedUser);

        assertEquals(idTransacao, response.idTransacao());
        assertEquals(contaOrigemId, response.contaOrigemId());
        assertEquals(contaDestinoId, response.contaDestinoId());
        assertEquals(request.valor(), response.valor());
        assertEquals(request.descricao(), response.descricao());
        assertEquals(dataHora, response.dataHora());

        ArgumentCaptor<PixTransaction> transactionCaptor = ArgumentCaptor.forClass(PixTransaction.class);
        verify(pixTransactionRepository).saveAndFlush(transactionCaptor.capture());

        PixTransaction transactionSentToRepository = transactionCaptor.getValue();
        assertEquals(contaOrigemId, transactionSentToRepository.getContaOrigemId());
        assertEquals(contaDestinoId, transactionSentToRepository.getContaDestinoId());
        assertEquals(request.valor(), transactionSentToRepository.getValor());
        assertEquals(request.descricao(), transactionSentToRepository.getDescricao());
        assertEquals(location.latitude(), transactionSentToRepository.getLocation().getLatitude());
        assertEquals(location.longitude(), response.location().longitude());
        assertEquals(location.accuracyMeters(), response.location().accuracyMeters());
        assertEquals(new BigDecimal("99.50"), originAccount.getBalance());
        assertEquals(new BigDecimal("150.50"), destinationAccount.getBalance());
        verify(accountRepository).save(originAccount);
        verify(accountRepository).save(destinationAccount);
        verify(pixKeyService).findByKeyForTransferForUpdate(PixKeyType.EMAIL, chavePix);
        ArgumentCaptor<PixTransferCompletedEvent> eventCaptor = ArgumentCaptor.forClass(PixTransferCompletedEvent.class);
        verify(events).publishEvent(eventCaptor.capture());
        assertEquals(authenticatedUser.getName(), eventCaptor.getValue().sender().getName());
        assertEquals(destinationUser.getName(), eventCaptor.getValue().recipient().getName());
        assertEquals(savedTransaction, eventCaptor.getValue().transaction());
    }

    @Test
    void extratoIncluiLocalizacaoPersistidaNaTransacao() {
        UUID userId = UUID.randomUUID();
        UUID accountId = UUID.randomUUID();
        UserModel user = UserModel.builder().id(userId).build();
        AccountModel account = AccountModel.builder().id(accountId).user(user).build();
        PixLocationData location = PixLocationData.builder()
                .latitude(new BigDecimal("-23.55"))
                .longitude(new BigDecimal("-46.63"))
                .accuracyMeters(new BigDecimal("18"))
                .source(PixLocationSource.BROWSER)
                .build();
        PixTransaction transaction = PixTransaction.builder()
                .idTransacao(UUID.randomUUID())
                .contaOrigemId(accountId)
                .contaDestinoId(UUID.randomUUID())
                .valor(BigDecimal.ONE)
                .dataHora(LocalDateTime.now())
                .location(location)
                .build();
        when(accountRepository.findByUserId(userId)).thenReturn(Optional.of(account));
        when(pixTransactionRepository.findAllByContaIdAndPeriodo(
                eq(accountId), any(LocalDateTime.class), any(LocalDateTime.class)))
                .thenReturn(List.of(transaction));

        PixExtractResponse response = pixTransactionService.gerarExtrato(user, null, null);

        assertEquals(location.getLatitude(), response.transacoes().get(0).location().latitude());
        assertEquals(location.getLongitude(), response.transacoes().get(0).location().longitude());
    }

    @Test
    void deveBloquearContaQuandoValorUltrapassarLimitePix() {
        UUID usuarioId = UUID.randomUUID();
        UUID contaOrigemId = UUID.randomUUID();
        UUID contaDestinoId = UUID.randomUUID();
        String chavePix = "destino@email.com";

        UserModel authenticatedUser = UserModel.builder().id(usuarioId).password("hash_senha").build();
        PixTransactionRequest request = new PixTransactionRequest(
                chavePix,
                new BigDecimal("1500.00"),
                "Transferência alta",
                PixKeyType.EMAIL,
                contaDestinoId,
                "Senha@123",
                UUID.randomUUID());

        AccountModel originAccount = AccountModel.builder()
                .user(authenticatedUser)
                .id(contaOrigemId)
                .balance(new BigDecimal("2000.00"))
                .status(AccountStatus.DESBLOQUEADA)
                .pixLimit(1000)
                .transactionLimit(10)
                .build();
        AccountModel destinationAccount = AccountModel.builder()
                .user(UserModel.builder().id(UUID.randomUUID()).build())
                .id(contaDestinoId)
                .balance(new BigDecimal("50.00"))
                .status(AccountStatus.DESBLOQUEADA)
                .build();
        PixKey destinationKey = PixKey.builder()
                .account(destinationAccount)
                .type(PixKeyType.EMAIL)
                .key(chavePix)
                .build();

        when(passwordEncoder.matches("Senha@123", "hash_senha")).thenReturn(true);
        when(accountRepository.findAccountIdByUserId(usuarioId)).thenReturn(Optional.of(contaOrigemId));
        when(pixKeyService.findByKeyForTransferForUpdate(PixKeyType.EMAIL, chavePix)).thenReturn(destinationKey);
        when(accountRepository.findByIdForUpdate(contaOrigemId)).thenReturn(Optional.of(originAccount));
        when(accountRepository.findByIdForUpdate(contaDestinoId)).thenReturn(Optional.of(destinationAccount));

        AccountBlockedException exception = assertThrows(
                AccountBlockedException.class,
                () -> pixTransactionService.create(request, authenticatedUser));

        assertTrue(exception.getMessage().contains("Suspeita de fraude: valor da transação"));
        assertEquals(AccountStatus.BLOQUEADA, originAccount.getStatus());

        verify(accountRepository).save(originAccount);
        verify(pixTransactionRepository, never()).saveAndFlush(any());
    }

    @Test
    void deveBloquearContaQuandoQuantidadeTransacoesUltrapassarLimite() {
        UUID usuarioId = UUID.randomUUID();
        UUID contaOrigemId = UUID.randomUUID();
        UUID contaDestinoId = UUID.randomUUID();
        String chavePix = "destino@email.com";

        UserModel authenticatedUser = UserModel.builder().id(usuarioId).password("hash_senha").build();
        PixTransactionRequest request = new PixTransactionRequest(
                chavePix,
                new BigDecimal("50.00"),
                "Transferência",
                PixKeyType.EMAIL,
                contaDestinoId,
                "Senha@123",
                UUID.randomUUID());

        AccountModel originAccount = AccountModel.builder()
                .user(authenticatedUser)
                .id(contaOrigemId)
                .balance(new BigDecimal("500.00"))
                .status(AccountStatus.DESBLOQUEADA)
                .pixLimit(1000)
                .transactionLimit(10)
                .build();
        AccountModel destinationAccount = AccountModel.builder()
                .user(UserModel.builder().id(UUID.randomUUID()).build())
                .id(contaDestinoId)
                .balance(new BigDecimal("50.00"))
                .status(AccountStatus.DESBLOQUEADA)
                .build();
        PixKey destinationKey = PixKey.builder()
                .account(destinationAccount)
                .type(PixKeyType.EMAIL)
                .key(chavePix)
                .build();

        when(passwordEncoder.matches("Senha@123", "hash_senha")).thenReturn(true);
        when(accountRepository.findAccountIdByUserId(usuarioId)).thenReturn(Optional.of(contaOrigemId));
        when(pixKeyService.findByKeyForTransferForUpdate(PixKeyType.EMAIL, chavePix)).thenReturn(destinationKey);
        when(accountRepository.findByIdForUpdate(contaOrigemId)).thenReturn(Optional.of(originAccount));
        when(accountRepository.findByIdForUpdate(contaDestinoId)).thenReturn(Optional.of(destinationAccount));
        when(pixTransactionRepository.countByContaOrigemIdAndDataHoraBetween(any(), any(), any()))
                .thenReturn(10L); 

        AccountBlockedException exception = assertThrows(
                AccountBlockedException.class,
                () -> pixTransactionService.create(request, authenticatedUser));

        assertTrue(exception.getMessage().contains("Suspeita de fraude: limite diário de transações"));
        assertEquals(AccountStatus.BLOQUEADA, originAccount.getStatus());

        verify(accountRepository).save(originAccount);
        verify(pixTransactionRepository, never()).saveAndFlush(any());
    }

    @Test
    void naoDevePermitirTransferenciaSeContaOrigemJaEstiverBloqueada() {
        UUID usuarioId = UUID.randomUUID();
        UUID contaOrigemId = UUID.randomUUID();
        UUID contaDestinoId = UUID.randomUUID();
        String chavePix = "destino@email.com";

        UserModel authenticatedUser = UserModel.builder().id(usuarioId).password("hash_senha").build();
        PixTransactionRequest request = new PixTransactionRequest(
                chavePix,
                new BigDecimal("50.00"),
                "Transferência",
                PixKeyType.EMAIL,
                contaDestinoId,
                "Senha@123",
                UUID.randomUUID());

        AccountModel originAccount = AccountModel.builder()
                .user(authenticatedUser)
                .id(contaOrigemId)
                .balance(new BigDecimal("500.00"))
                .status(AccountStatus.BLOQUEADA)
                .pixLimit(1000)
                .transactionLimit(10)
                .build();
        AccountModel destinationAccount = AccountModel.builder()
                .user(UserModel.builder().id(UUID.randomUUID()).build())
                .id(contaDestinoId)
                .balance(new BigDecimal("50.00"))
                .status(AccountStatus.DESBLOQUEADA)
                .build();
        PixKey destinationKey = PixKey.builder()
                .account(destinationAccount)
                .type(PixKeyType.EMAIL)
                .key(chavePix)
                .build();

        when(passwordEncoder.matches("Senha@123", "hash_senha")).thenReturn(true);
        when(accountRepository.findAccountIdByUserId(usuarioId)).thenReturn(Optional.of(contaOrigemId));
        when(pixKeyService.findByKeyForTransferForUpdate(PixKeyType.EMAIL, chavePix)).thenReturn(destinationKey);
        when(accountRepository.findByIdForUpdate(contaOrigemId)).thenReturn(Optional.of(originAccount));
        when(accountRepository.findByIdForUpdate(contaDestinoId)).thenReturn(Optional.of(destinationAccount));

        AccountBlockedException exception = assertThrows(
                AccountBlockedException.class,
                () -> pixTransactionService.create(request, authenticatedUser));

        assertTrue(exception.getMessage().contains("Conta de origem bloqueada"));
        verify(pixTransactionRepository, never()).saveAndFlush(any());
    }

    @Test
    void naoDevePermitirTransferenciaSeContaDestinoEstiverBloqueada() {
        UUID usuarioId = UUID.randomUUID();
        UUID contaOrigemId = UUID.randomUUID();
        UUID contaDestinoId = UUID.randomUUID();
        String chavePix = "destino@email.com";

        UserModel authenticatedUser = UserModel.builder().id(usuarioId).password("hash_senha").build();
        PixTransactionRequest request = new PixTransactionRequest(
                chavePix,
                new BigDecimal("50.00"),
                "Transferência",
                PixKeyType.EMAIL,
                contaDestinoId,
                "Senha@123",
                UUID.randomUUID());

        AccountModel originAccount = AccountModel.builder()
                .user(authenticatedUser)
                .id(contaOrigemId)
                .balance(new BigDecimal("500.00"))
                .status(AccountStatus.DESBLOQUEADA)
                .pixLimit(1000)
                .transactionLimit(10)
                .build();
        AccountModel destinationAccount = AccountModel.builder()
                .user(UserModel.builder().id(UUID.randomUUID()).build())
                .id(contaDestinoId)
                .balance(new BigDecimal("50.00"))
                .status(AccountStatus.BLOQUEADA)
                .build();
        PixKey destinationKey = PixKey.builder()
                .account(destinationAccount)
                .type(PixKeyType.EMAIL)
                .key(chavePix)
                .build();

        when(passwordEncoder.matches("Senha@123", "hash_senha")).thenReturn(true);
        when(accountRepository.findAccountIdByUserId(usuarioId)).thenReturn(Optional.of(contaOrigemId));
        when(pixKeyService.findByKeyForTransferForUpdate(PixKeyType.EMAIL, chavePix)).thenReturn(destinationKey);
        when(accountRepository.findByIdForUpdate(contaOrigemId)).thenReturn(Optional.of(originAccount));
        when(accountRepository.findByIdForUpdate(contaDestinoId)).thenReturn(Optional.of(destinationAccount));

        AccountBlockedException exception = assertThrows(
                AccountBlockedException.class,
                () -> pixTransactionService.create(request, authenticatedUser));

        assertTrue(exception.getMessage().contains("Conta de destino bloqueada"));
        verify(pixTransactionRepository, never()).saveAndFlush(any());
    }

    @Test
    void naoDevePermitirTransferirParaAPropriaChavePix() {
        UUID usuarioId = UUID.randomUUID();
        UUID contaId = UUID.randomUUID();
        String chavePix = "propria@email.com";
        UserModel authenticatedUser = UserModel.builder().id(usuarioId).password("hash_senha").build();
        AccountModel account = AccountModel.builder().id(contaId).build();
        PixKey pixKey = PixKey.builder().account(account).key(chavePix).build();
        PixTransactionRequest request = new PixTransactionRequest(
                chavePix,
                new BigDecimal("10.00"),
                null,
                PixKeyType.EMAIL,
                contaId,
                "Senha@123",
                UUID.randomUUID());

        when(passwordEncoder.matches("Senha@123", "hash_senha")).thenReturn(true);
        when(accountRepository.findAccountIdByUserId(usuarioId)).thenReturn(Optional.of(contaId));
        when(pixKeyService.findByKeyForTransferForUpdate(PixKeyType.EMAIL, chavePix)).thenReturn(pixKey);

        assertThrows(
                InvalidPixTransactionException.class,
                () -> pixTransactionService.create(request, authenticatedUser));

        verify(pixTransactionRepository).findByContaOrigemIdAndIdempotencyKey(contaId, request.idempotencyKey());
        verify(pixTransactionRepository, never()).saveAndFlush(any());
    }

    @Test
    void naoDevePermitirValorInvalido() {
        UserModel authenticatedUser = UserModel.builder().id(UUID.randomUUID()).password("hash_senha").build();
        PixTransactionRequest request = new PixTransactionRequest(
                "destino@email.com",
                BigDecimal.ZERO,
                null,
                PixKeyType.EMAIL,
                UUID.randomUUID(),
                "Senha@123",
                UUID.randomUUID());

        assertThrows(
                InvalidPixTransactionException.class,
                () -> pixTransactionService.create(request, authenticatedUser));

        verifyNoInteractions(pixTransactionRepository);
    }

    @Test
    void naoDevePermitirDadosObrigatoriosNulos() {
        UserModel authenticatedUser = UserModel.builder().id(UUID.randomUUID()).password("hash_senha").build();

        assertThrows(
                InvalidPixTransactionException.class,
                () -> pixTransactionService.create(null, authenticatedUser));

        PixTransactionRequest requestSemValor = new PixTransactionRequest(
                "destino@email.com",
                null,
                null,
                PixKeyType.EMAIL,
                UUID.randomUUID(),
                "Senha@123",
                UUID.randomUUID());

        assertThrows(
                InvalidPixTransactionException.class,
                () -> pixTransactionService.create(requestSemValor, authenticatedUser));

        verifyNoInteractions(pixTransactionRepository);
    }
}
