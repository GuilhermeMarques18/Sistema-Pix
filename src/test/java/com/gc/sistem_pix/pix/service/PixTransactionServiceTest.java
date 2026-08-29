package com.gc.sistem_pix.pix.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.gc.sistem_pix.pix.dto.PixTransactionRequest;
import com.gc.sistem_pix.pix.dto.PixTransactionResponse;
import com.gc.sistem_pix.pix.entity.PixTransaction;
import com.gc.sistem_pix.pix.exception.InvalidPixTransactionException;
import com.gc.sistem_pix.pix.repository.PixTransactionRepository;

@ExtendWith(MockitoExtension.class)
class PixTransactionServiceTest {

        @Mock
        private PixTransactionRepository pixTransactionRepository;

        @InjectMocks
        private PixTransactionService pixTransactionService;

        @Test
        void deveSalvarUmaTransacaoValidaERetornarResposta() {
                UUID contaOrigemId = UUID.randomUUID();
                UUID contaDestinoId = UUID.randomUUID();
                UUID idTransacao = UUID.randomUUID();
                LocalDateTime dataHora = LocalDateTime.now();

                PixTransactionRequest request = new PixTransactionRequest(
                                contaOrigemId,
                                contaDestinoId,
                                new BigDecimal("100.50"),
                                "Pagamento");

                PixTransaction savedTransaction = PixTransaction.builder()
                                .idTransacao(idTransacao)
                                .contaOrigemId(contaOrigemId)
                                .contaDestinoId(contaDestinoId)
                                .valor(request.valor())
                                .descricao(request.descricao())
                                .dataHora(dataHora)
                                .build();

                when(pixTransactionRepository.save(org.mockito.ArgumentMatchers.any(PixTransaction.class)))
                                .thenReturn(savedTransaction);

                PixTransactionResponse response = pixTransactionService.create(request);

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
        }

        @Test
        void naoDevePermitirContasDeOrigemEDestinoIguais() {
                UUID contaId = UUID.randomUUID();
                PixTransactionRequest request = new PixTransactionRequest(
                                contaId,
                                contaId,
                                new BigDecimal("10.00"),
                                null);

                assertThrows(
                                InvalidPixTransactionException.class,
                                () -> pixTransactionService.create(request));

                verifyNoInteractions(pixTransactionRepository);
        }

        @Test
        void naoDevePermitirValorInvalido() {
                PixTransactionRequest request = new PixTransactionRequest(
                                UUID.randomUUID(),
                                UUID.randomUUID(),
                                BigDecimal.ZERO,
                                null);

                assertThrows(
                                InvalidPixTransactionException.class,
                                () -> pixTransactionService.create(request));

                verifyNoInteractions(pixTransactionRepository);
        }

        @Test
        void naoDevePermitirDadosObrigatoriosNulos() {
                assertThrows(
                                InvalidPixTransactionException.class,
                                () -> pixTransactionService.create(null));

                PixTransactionRequest requestSemValor = new PixTransactionRequest(
                                UUID.randomUUID(),
                                UUID.randomUUID(),
                                null,
                                null);

                assertThrows(
                                InvalidPixTransactionException.class,
                                () -> pixTransactionService.create(requestSemValor));

                verifyNoInteractions(pixTransactionRepository);
        }
}
