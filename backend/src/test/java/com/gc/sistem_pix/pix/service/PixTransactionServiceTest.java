package com.gc.sistem_pix.pix.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.gc.sistem_pix.account.entity.AccountModel;
import com.gc.sistem_pix.account.enums.AccountStatus;
import com.gc.sistem_pix.account.repository.AccountRepository;
import com.gc.sistem_pix.pix.dto.PixTransactionRequest;
import com.gc.sistem_pix.pix.dto.PixTransactionResponse;
import com.gc.sistem_pix.pix.entity.PixKey;
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

        UserModel authenticatedUser = UserModel.builder().id(usuarioId).build();
        PixTransactionRequest request = new PixTransactionRequest(
                chavePix,
                new BigDecimal("100.50"),
                "Pagamento");

        AccountModel originAccount = AccountModel.builder()
                .id(contaOrigemId)
                .balance(new BigDecimal("200.00"))
                .status(AccountStatus.DESBLOQUEADA)
                .build();
        AccountModel destinationAccount = AccountModel.builder()
                .id(contaDestinoId)
                .balance(new BigDecimal("50.00"))
                .status(AccountStatus.DESBLOQUEADA)
                .build();
        PixKey destinationKey = PixKey.builder()
                .account(destinationAccount)
                .type(PixKeyType.EMAIL)
                .key(chavePix)
                .build();

        when(accountRepository.findByUserId(usuarioId)).thenReturn(Optional.of(originAccount));
        when(pixKeyService.findByKeyForTransfer(chavePix)).thenReturn(destinationKey);
        when(accountRepository.findByIdForUpdate(contaOrigemId))
                .thenReturn(Optional.of(originAccount));
        when(accountRepository.findByIdForUpdate(contaDestinoId))
                .thenReturn(Optional.of(destinationAccount));

        PixTransaction savedTransaction = PixTransaction.builder()
                .idTransacao(idTransacao)
                .contaOrigemId(contaOrigemId)
                .contaDestinoId(contaDestinoId)
                .valor(request.valor())
                .descricao(request.descricao())
                .dataHora(dataHora)
                .build();

        when(pixTransactionRepository.save(any(PixTransaction.class)))
                .thenReturn(savedTransaction);

        PixTransactionResponse response = pixTransactionService.create(request, authenticatedUser);

        assertEquals(idTransacao, response.idTransacao());
        assertEquals(contaOrigemId, response.contaOrigemId());
        assertEquals(contaDestinoId, response.contaDestinoId());
        assertEquals(request.valor(), response.valor());
        assertEquals(request.descricao(), response.descricao());
        assertEquals(dataHora, response.dataHora());

        ArgumentCaptor<PixTransaction> transactionCaptor = ArgumentCaptor.forClass(PixTransaction.class);
        verify(pixTransactionRepository).save(transactionCaptor.capture());

        PixTransaction transactionSentToRepository = transactionCaptor.getValue();
        assertEquals(contaOrigemId, transactionSentToRepository.getContaOrigemId());
        assertEquals(contaDestinoId, transactionSentToRepository.getContaDestinoId());
        assertEquals(request.valor(), transactionSentToRepository.getValor());
        assertEquals(request.descricao(), transactionSentToRepository.getDescricao());
        assertEquals(new BigDecimal("99.50"), originAccount.getBalance());
        assertEquals(new BigDecimal("150.50"), destinationAccount.getBalance());
        verify(accountRepository).save(originAccount);
        verify(accountRepository).save(destinationAccount);
        verify(pixKeyService).findByKeyForTransfer(chavePix);
    }

    @Test
    void naoDevePermitirTransferirParaAPropriaChavePix() {
        UUID usuarioId = UUID.randomUUID();
        UUID contaId = UUID.randomUUID();
        String chavePix = "propria@email.com";
        UserModel authenticatedUser = UserModel.builder().id(usuarioId).build();
        AccountModel account = AccountModel.builder().id(contaId).build();
        PixKey pixKey = PixKey.builder().account(account).key(chavePix).build();
        PixTransactionRequest request = new PixTransactionRequest(
                chavePix,
                new BigDecimal("10.00"),
                null);

        when(accountRepository.findByUserId(usuarioId)).thenReturn(Optional.of(account));
        when(pixKeyService.findByKeyForTransfer(chavePix)).thenReturn(pixKey);

        assertThrows(
                InvalidPixTransactionException.class,
                () -> pixTransactionService.create(request, authenticatedUser));

        verifyNoInteractions(pixTransactionRepository);
    }

    @Test
    void naoDevePermitirValorInvalido() {
        UserModel authenticatedUser = UserModel.builder().id(UUID.randomUUID()).build();
        PixTransactionRequest request = new PixTransactionRequest(
                "destino@email.com",
                BigDecimal.ZERO,
                null);

        assertThrows(
                InvalidPixTransactionException.class,
                () -> pixTransactionService.create(request, authenticatedUser));

        verifyNoInteractions(pixTransactionRepository);
    }

    @Test
    void naoDevePermitirDadosObrigatoriosNulos() {
        UserModel authenticatedUser = UserModel.builder().id(UUID.randomUUID()).build();

        assertThrows(
                InvalidPixTransactionException.class,
                () -> pixTransactionService.create(null, authenticatedUser));

        PixTransactionRequest requestSemValor = new PixTransactionRequest(
                "destino@email.com",
                null,
                null);

        assertThrows(
                InvalidPixTransactionException.class,
                () -> pixTransactionService.create(requestSemValor, authenticatedUser));

        verifyNoInteractions(pixTransactionRepository);
    }
}
