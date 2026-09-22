package com.gc.sistem_pix.dispute.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import com.gc.sistem_pix.account.entity.AccountModel;
import com.gc.sistem_pix.account.enums.AccountStatus;
import com.gc.sistem_pix.account.enums.AccountType;
import com.gc.sistem_pix.account.exception.InsufficientBalanceException;
import com.gc.sistem_pix.account.repository.AccountRepository;
import com.gc.sistem_pix.dispute.dto.ContestDisputeRequest;
import com.gc.sistem_pix.dispute.dto.CreateDisputeRequest;
import com.gc.sistem_pix.dispute.dto.DisputeResponseDTO;
import com.gc.sistem_pix.dispute.dto.ResolveDisputeAdminRequest;
import com.gc.sistem_pix.dispute.entity.DisputeModel;
import com.gc.sistem_pix.dispute.enums.DisputeResolvedBy;
import com.gc.sistem_pix.dispute.enums.DisputeStatus;
import com.gc.sistem_pix.dispute.exception.DisputeAlreadyExistsException;
import com.gc.sistem_pix.dispute.exception.DisputeTimeLimitExceededException;
import com.gc.sistem_pix.dispute.exception.InvalidDisputeOperationException;
import com.gc.sistem_pix.dispute.repository.DisputeRepository;
import com.gc.sistem_pix.pix.entity.PixTransaction;
import com.gc.sistem_pix.pix.repository.PixTransactionRepository;
import com.gc.sistem_pix.user.entity.UserModel;
import com.gc.sistem_pix.user.enums.UserRole;

@ExtendWith(MockitoExtension.class)
class DisputeServiceTest {

    @Mock
    private DisputeRepository disputeRepository;

    @Mock
    private PixTransactionRepository pixTransactionRepository;

    @Mock
    private AccountRepository accountRepository;

    @InjectMocks
    private DisputeService disputeService;

    private UserModel userOrigem;
    private UserModel userDestino;
    private UserModel userAdmin;
    private AccountModel contaOrigem;
    private AccountModel contaDestino;
    private PixTransaction transacao;

    @BeforeEach
    void setUp() {
        userOrigem = UserModel.builder()
                .id(UUID.randomUUID())
                .name("Emissor")
                .role(UserRole.USER)
                .build();

        userDestino = UserModel.builder()
                .id(UUID.randomUUID())
                .name("Recebedor")
                .role(UserRole.USER)
                .build();

        userAdmin = UserModel.builder()
                .id(UUID.randomUUID())
                .name("Admin")
                .role(UserRole.ADMIN)
                .build();

        contaOrigem = AccountModel.builder()
                .id(UUID.randomUUID())
                .user(userOrigem)
                .status(AccountStatus.DESBLOQUEADA)
                .type(AccountType.PESSOA_FISICA)
                .build();

        contaDestino = AccountModel.builder()
                .id(UUID.randomUUID())
                .user(userDestino)
                .status(AccountStatus.DESBLOQUEADA)
                .type(AccountType.PESSOA_FISICA)
                .build();

        transacao = PixTransaction.builder()
                .idTransacao(UUID.randomUUID())
                .contaOrigemId(contaOrigem.getId())
                .contaDestinoId(contaDestino.getId())
                .valor(new BigDecimal("500.00"))
                .dataHora(LocalDateTime.now().minusHours(2))
                .descricao("Pix de teste")
                .build();
    }

    @Test
    @DisplayName("Deve abrir disputa com sucesso e reter saldo cautelar no recebedor")
    void deveAbrirDisputaComSucesso() {
        contaDestino.credit(new BigDecimal("1000.00"));
        CreateDisputeRequest request = new CreateDisputeRequest(transacao.getIdTransacao(), "Enviei para chave errada");

        when(pixTransactionRepository.findById(transacao.getIdTransacao())).thenReturn(Optional.of(transacao));
        when(accountRepository.findByUserId(userOrigem.getId())).thenReturn(Optional.of(contaOrigem));
        when(disputeRepository.existsByTransacaoIdTransacao(transacao.getIdTransacao())).thenReturn(false);
        when(accountRepository.findByIdForUpdate(contaDestino.getId())).thenReturn(Optional.of(contaDestino));
        when(disputeRepository.save(any(DisputeModel.class))).thenAnswer(invocation -> {
            DisputeModel model = invocation.getArgument(0);
            model.setIdDisputa(UUID.randomUUID());
            return model;
        });

        DisputeResponseDTO response = disputeService.abrirDisputa(request, userOrigem);

        assertNotNull(response);
        assertEquals(DisputeStatus.ABERTA, response.status());
        assertEquals(new BigDecimal("500.00"), response.valor());
        assertEquals(new BigDecimal("500.00"), contaDestino.getBlockedBalance());
        assertEquals(new BigDecimal("500.00"), contaDestino.getAvailableBalance());
        verify(accountRepository).save(contaDestino);
        verify(disputeRepository).save(any(DisputeModel.class));
    }

    @Test
    @DisplayName("Deve falhar ao abrir disputa se prazo de 3 dias corridos expirou")
    void deveFalharAoAbrirDisputaAposTresDias() {
        transacao.setDataHora(LocalDateTime.now().minusDays(3).minusMinutes(1));
        CreateDisputeRequest request = new CreateDisputeRequest(transacao.getIdTransacao(), "Enviei errado");

        when(pixTransactionRepository.findById(transacao.getIdTransacao())).thenReturn(Optional.of(transacao));
        when(accountRepository.findByUserId(userOrigem.getId())).thenReturn(Optional.of(contaOrigem));
        when(disputeRepository.existsByTransacaoIdTransacao(transacao.getIdTransacao())).thenReturn(false);

        assertThrows(DisputeTimeLimitExceededException.class, () ->
                disputeService.abrirDisputa(request, userOrigem));
    }

    @Test
    @DisplayName("Deve falhar ao abrir disputa se o saldo disponível do recebedor for menor que o valor")
    void deveFalharAoAbrirDisputaSeSaldoInsuficienteNoDestino() {
        contaDestino.credit(new BigDecimal("200.00")); // transação é de 500
        CreateDisputeRequest request = new CreateDisputeRequest(transacao.getIdTransacao(), "Enviei errado");

        when(pixTransactionRepository.findById(transacao.getIdTransacao())).thenReturn(Optional.of(transacao));
        when(accountRepository.findByUserId(userOrigem.getId())).thenReturn(Optional.of(contaOrigem));
        when(disputeRepository.existsByTransacaoIdTransacao(transacao.getIdTransacao())).thenReturn(false);
        when(accountRepository.findByIdForUpdate(contaDestino.getId())).thenReturn(Optional.of(contaDestino));

        assertThrows(InsufficientBalanceException.class, () ->
                disputeService.abrirDisputa(request, userOrigem));
    }

    @Test
    @DisplayName("Deve falhar ao abrir disputa se o solicitante não for o emissor do Pix")
    void deveFalharSeNaoForEmissor() {
        CreateDisputeRequest request = new CreateDisputeRequest(transacao.getIdTransacao(), "Tentando abrir");

        AccountModel outraConta = AccountModel.builder().id(UUID.randomUUID()).build();
        when(pixTransactionRepository.findById(transacao.getIdTransacao())).thenReturn(Optional.of(transacao));
        when(accountRepository.findByUserId(userOrigem.getId())).thenReturn(Optional.of(outraConta));

        assertThrows(InvalidDisputeOperationException.class, () ->
                disputeService.abrirDisputa(request, userOrigem));
    }

    @Test
    @DisplayName("Deve falhar ao abrir disputa se já existir uma disputa para a transação")
    void deveFalharSeDisputaJaExiste() {
        CreateDisputeRequest request = new CreateDisputeRequest(transacao.getIdTransacao(), "Nova tentativa");

        when(pixTransactionRepository.findById(transacao.getIdTransacao())).thenReturn(Optional.of(transacao));
        when(accountRepository.findByUserId(userOrigem.getId())).thenReturn(Optional.of(contaOrigem));
        when(disputeRepository.existsByTransacaoIdTransacao(transacao.getIdTransacao())).thenReturn(true);

        assertThrows(DisputeAlreadyExistsException.class, () ->
                disputeService.abrirDisputa(request, userOrigem));
    }

    @Test
    @DisplayName("Deve permitir ao emissor cancelar a disputa voluntariamente e desbloquear o saldo do recebedor")
    void deveCancelarDisputaVoluntariamente() {
        contaDestino.credit(new BigDecimal("1000.00"));
        contaDestino.blockBalanceForDispute(new BigDecimal("500.00"));

        DisputeModel disputa = DisputeModel.builder()
                .idDisputa(UUID.randomUUID())
                .transacao(transacao)
                .contaSolicitante(contaOrigem)
                .contaDestino(contaDestino)
                .valor(new BigDecimal("500.00"))
                .status(DisputeStatus.ABERTA)
                .build();

        when(disputeRepository.findById(disputa.getIdDisputa())).thenReturn(Optional.of(disputa));
        when(accountRepository.findByIdForUpdate(contaDestino.getId())).thenReturn(Optional.of(contaDestino));
        when(disputeRepository.save(any(DisputeModel.class))).thenAnswer(i -> i.getArgument(0));

        DisputeResponseDTO response = disputeService.cancelarDisputa(disputa.getIdDisputa(), userOrigem);

        assertEquals(DisputeStatus.CANCELADA, response.status());
        assertEquals(DisputeResolvedBy.EMISSOR, response.resolvidoPor());
        assertEquals(new BigDecimal("0.00"), contaDestino.getBlockedBalance());
        assertEquals(new BigDecimal("1000.00"), contaDestino.getAvailableBalance());
    }

    @Test
    @DisplayName("Deve permitir ao recebedor aceitar a disputa voluntariamente estornando o valor")
    void deveAceitarDisputaPeloRecebedor() {
        contaDestino.credit(new BigDecimal("1000.00"));
        contaDestino.blockBalanceForDispute(new BigDecimal("500.00"));

        DisputeModel disputa = DisputeModel.builder()
                .idDisputa(UUID.randomUUID())
                .transacao(transacao)
                .contaSolicitante(contaOrigem)
                .contaDestino(contaDestino)
                .valor(new BigDecimal("500.00"))
                .status(DisputeStatus.ABERTA)
                .build();

        when(disputeRepository.findById(disputa.getIdDisputa())).thenReturn(Optional.of(disputa));
        when(accountRepository.findByIdForUpdate(contaDestino.getId())).thenReturn(Optional.of(contaDestino));
        when(accountRepository.findByIdForUpdate(contaOrigem.getId())).thenReturn(Optional.of(contaOrigem));
        when(disputeRepository.save(any(DisputeModel.class))).thenAnswer(i -> i.getArgument(0));

        DisputeResponseDTO response = disputeService.aceitarDisputaPeloRecebedor(disputa.getIdDisputa(), userDestino);

        assertEquals(DisputeStatus.APROVADA, response.status());
        assertEquals(DisputeResolvedBy.RECEBEDOR, response.resolvidoPor());
        assertEquals(new BigDecimal("500.00"), contaDestino.getBalance());
        assertEquals(new BigDecimal("500.00"), contaOrigem.getBalance());
        assertTrue(transacao.isTransacaoEstornada());
        verify(pixTransactionRepository, org.mockito.Mockito.times(2)).save(any(PixTransaction.class));
    }

    @Test
    @DisplayName("Deve permitir ao recebedor contestar a disputa inserindo justificativa")
    void deveContestarDisputaPeloRecebedor() {
        DisputeModel disputa = DisputeModel.builder()
                .idDisputa(UUID.randomUUID())
                .transacao(transacao)
                .contaSolicitante(contaOrigem)
                .contaDestino(contaDestino)
                .valor(new BigDecimal("500.00"))
                .status(DisputeStatus.ABERTA)
                .build();

        ContestDisputeRequest request = new ContestDisputeRequest("O pagamento foi referente ao aluguel acordado");

        when(disputeRepository.findById(disputa.getIdDisputa())).thenReturn(Optional.of(disputa));
        when(disputeRepository.save(any(DisputeModel.class))).thenAnswer(i -> i.getArgument(0));

        DisputeResponseDTO response = disputeService.contestarDisputaPeloRecebedor(
                disputa.getIdDisputa(), request, userDestino);

        assertEquals(DisputeStatus.CONTESTADA, response.status());
        assertEquals("O pagamento foi referente ao aluguel acordado", response.justificativaRecebedor());
    }

    @Test
    @DisplayName("Deve permitir ao Admin aprovar disputa executando estorno")
    void devePermitirAdminAprovarDisputa() {
        contaDestino.credit(new BigDecimal("1000.00"));
        contaDestino.blockBalanceForDispute(new BigDecimal("500.00"));

        DisputeModel disputa = DisputeModel.builder()
                .idDisputa(UUID.randomUUID())
                .transacao(transacao)
                .contaSolicitante(contaOrigem)
                .contaDestino(contaDestino)
                .valor(new BigDecimal("500.00"))
                .status(DisputeStatus.CONTESTADA)
                .build();

        ResolveDisputeAdminRequest request = new ResolveDisputeAdminRequest(true, "Comprovado erro de digitação da chave");

        when(disputeRepository.findById(disputa.getIdDisputa())).thenReturn(Optional.of(disputa));
        when(accountRepository.findByIdForUpdate(contaDestino.getId())).thenReturn(Optional.of(contaDestino));
        when(accountRepository.findByIdForUpdate(contaOrigem.getId())).thenReturn(Optional.of(contaOrigem));
        when(disputeRepository.save(any(DisputeModel.class))).thenAnswer(i -> i.getArgument(0));

        DisputeResponseDTO response = disputeService.julgarDisputaAdmin(disputa.getIdDisputa(), request, userAdmin);

        assertEquals(DisputeStatus.APROVADA, response.status());
        assertEquals(DisputeResolvedBy.ADMIN, response.resolvidoPor());
        assertEquals(new BigDecimal("500.00"), contaDestino.getBalance());
        assertEquals(new BigDecimal("500.00"), contaOrigem.getBalance());
        assertTrue(transacao.isTransacaoEstornada());
    }

    @Test
    @DisplayName("Deve permitir ao Admin recusar disputa desbloqueando o saldo no recebedor")
    void devePermitirAdminRecusarDisputa() {
        contaDestino.credit(new BigDecimal("1000.00"));
        contaDestino.blockBalanceForDispute(new BigDecimal("500.00"));

        DisputeModel disputa = DisputeModel.builder()
                .idDisputa(UUID.randomUUID())
                .transacao(transacao)
                .contaSolicitante(contaOrigem)
                .contaDestino(contaDestino)
                .valor(new BigDecimal("500.00"))
                .status(DisputeStatus.CONTESTADA)
                .build();

        ResolveDisputeAdminRequest request = new ResolveDisputeAdminRequest(false, "Serviço comprovadamente entregue");

        when(disputeRepository.findById(disputa.getIdDisputa())).thenReturn(Optional.of(disputa));
        when(accountRepository.findByIdForUpdate(contaDestino.getId())).thenReturn(Optional.of(contaDestino));
        when(disputeRepository.save(any(DisputeModel.class))).thenAnswer(i -> i.getArgument(0));

        DisputeResponseDTO response = disputeService.julgarDisputaAdmin(disputa.getIdDisputa(), request, userAdmin);

        assertEquals(DisputeStatus.RECUSADA, response.status());
        assertEquals(DisputeResolvedBy.ADMIN, response.resolvidoPor());
        assertEquals(new BigDecimal("0.00"), contaDestino.getBlockedBalance());
        assertEquals(new BigDecimal("1000.00"), contaDestino.getAvailableBalance());
    }

    @Test
    @DisplayName("Deve impedir usuário comum de julgar disputa")
    void deveImpedirUsuarioComumDeJulgarDisputa() {
        UUID disputeId = UUID.randomUUID();
        ResolveDisputeAdminRequest request = new ResolveDisputeAdminRequest(true, "Tentativa indevida");

        assertThrows(AccessDeniedException.class, () ->
                disputeService.julgarDisputaAdmin(disputeId, request, userOrigem));
    }
}
