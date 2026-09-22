package com.gc.sistem_pix.dispute.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gc.sistem_pix.account.entity.AccountModel;
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
import com.gc.sistem_pix.user.exception.ResourceNotFoundException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final PixTransactionRepository pixTransactionRepository;
    private final AccountRepository accountRepository;

    @Transactional
    public DisputeResponseDTO abrirDisputa(CreateDisputeRequest request, UserModel usuarioLogado) {
        validateAuthenticatedUser(usuarioLogado);

        PixTransaction transacao = pixTransactionRepository.findById(request.idTransacao()).orElseThrow(
                () -> new ResourceNotFoundException("Transação Pix não encontrada: " + request.idTransacao()));

        AccountModel contaOrigem = accountRepository.findByUserId(usuarioLogado.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Conta bancária do usuário não encontrada"));

        if (!contaOrigem.getId().equals(transacao.getContaOrigemId())) {
            throw new InvalidDisputeOperationException("Apenas o emissor da transação Pix pode abrir uma disputa");
        }

        if (transacao.isTransacaoEstornada()) {
            throw new InvalidDisputeOperationException("Esta transação já foi estornada e não permite disputa");
        }

        if (disputeRepository.existsByTransacaoIdTransacao(transacao.getIdTransacao())) {
            throw new DisputeAlreadyExistsException("Já existe uma disputa registrada para esta transação");
        }

        LocalDateTime prazoLimite = transacao.getDataHora().plusDays(3);
        if (LocalDateTime.now().isAfter(prazoLimite)) {
            throw new DisputeTimeLimitExceededException(
                    "O prazo limite de 3 dias corridos para abertura de disputa expirou em " + prazoLimite);
        }

        AccountModel contaDestino = accountRepository.findByIdForUpdate(transacao.getContaDestinoId())
                .orElseThrow(() -> new ResourceNotFoundException("Conta bancária de destino não encontrada"));

        if (contaDestino.getAvailableBalance().compareTo(transacao.getValor()) < 0) {
            throw new InsufficientBalanceException(
                    "A disputa não pode ser aberta pois o recebedor não possui saldo suficiente disponível");
        }

        contaDestino.blockBalanceForDispute(transacao.getValor());
        accountRepository.save(contaDestino);

        DisputeModel disputa = DisputeModel.builder()
                .transacao(transacao)
                .contaSolicitante(contaOrigem)
                .contaDestino(contaDestino)
                .valor(transacao.getValor())
                .motivoAbertura(request.motivo())
                .status(DisputeStatus.ABERTA)
                .build();

        return toResponseDTO(disputeRepository.save(disputa));
    }

    @Transactional
    public DisputeResponseDTO cancelarDisputa(UUID disputeId, UserModel usuarioLogado) {
        validateAuthenticatedUser(usuarioLogado);

        DisputeModel disputa = findDisputeOrThrow(disputeId);

        if (!disputa.getContaSolicitante().getUser().getId().equals(usuarioLogado.getId())) {
            throw new InvalidDisputeOperationException("Apenas o emissor da disputa pode cancelá-la");
        }

        if (disputa.getStatus() != DisputeStatus.ABERTA && disputa.getStatus() != DisputeStatus.CONTESTADA) {
            throw new InvalidDisputeOperationException(
                    "A disputa só pode ser cancelada se estiver em aberto ou contestada. Status atual: "
                            + disputa.getStatus());
        }

        AccountModel contaDestino = accountRepository.findByIdForUpdate(disputa.getContaDestino().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Conta de destino não encontrada"));

        contaDestino.unblockBalanceFromDispute(disputa.getValor());
        accountRepository.save(contaDestino);

        disputa.setStatus(DisputeStatus.CANCELADA);
        disputa.setResolvidoPor(DisputeResolvedBy.EMISSOR);
        disputa.setResolvidoEm(LocalDateTime.now());

        return toResponseDTO(disputeRepository.save(disputa));
    }

    @Transactional
    public DisputeResponseDTO aceitarDisputaPeloRecebedor(UUID disputeId, UserModel usuarioLogado) {
        validateAuthenticatedUser(usuarioLogado);

        DisputeModel disputa = findDisputeOrThrow(disputeId);

        if (!disputa.getContaDestino().getUser().getId().equals(usuarioLogado.getId())) {
            throw new InvalidDisputeOperationException("Apenas o recebedor da transação pode aceitar a reversão");
        }

        if (disputa.getStatus() != DisputeStatus.ABERTA && disputa.getStatus() != DisputeStatus.CONTESTADA) {
            throw new InvalidDisputeOperationException(
                    "A disputa não pode ser aceita no status atual: " + disputa.getStatus());
        }

        executarEstornoFinanceiro(disputa);

        disputa.setStatus(DisputeStatus.APROVADA);
        disputa.setResolvidoPor(DisputeResolvedBy.RECEBEDOR);
        disputa.setResolvidoEm(LocalDateTime.now());

        return toResponseDTO(disputeRepository.save(disputa));
    }

    @Transactional
    public DisputeResponseDTO contestarDisputaPeloRecebedor(
            UUID disputeId,
            ContestDisputeRequest request,
            UserModel usuarioLogado) {
        validateAuthenticatedUser(usuarioLogado);

        DisputeModel disputa = findDisputeOrThrow(disputeId);

        if (!disputa.getContaDestino().getUser().getId().equals(usuarioLogado.getId())) {
            throw new InvalidDisputeOperationException("Apenas o recebedor da transação pode contestar a reversão");
        }

        if (disputa.getStatus() != DisputeStatus.ABERTA) {
            throw new InvalidDisputeOperationException(
                    "A disputa só pode ser contestada se estiver no status ABERTA. Status atual: "
                            + disputa.getStatus());
        }

        disputa.setJustificativaRecebedor(request.justificativa());
        disputa.setStatus(DisputeStatus.CONTESTADA);

        return toResponseDTO(disputeRepository.save(disputa));
    }

    @Transactional
    public DisputeResponseDTO julgarDisputaAdmin(
            UUID disputeId,
            ResolveDisputeAdminRequest request,
            UserModel adminUser) {
        validateAuthenticatedUser(adminUser);

        if (adminUser.getRole() != UserRole.ADMIN && adminUser.getRole() != UserRole.OWNER) {
            throw new AccessDeniedException("Apenas administradores ou o Owner podem julgar disputas");
        }

        DisputeModel disputa = findDisputeOrThrow(disputeId);

        if (disputa.getStatus() != DisputeStatus.ABERTA && disputa.getStatus() != DisputeStatus.CONTESTADA) {
            throw new InvalidDisputeOperationException(
                    "Apenas disputas abertas ou contestadas podem ser julgadas. Status atual: " + disputa.getStatus());
        }

        if (Boolean.TRUE.equals(request.aprovado())) {
            executarEstornoFinanceiro(disputa);
            disputa.setStatus(DisputeStatus.APROVADA);
        } else {
            AccountModel contaDestino = accountRepository.findByIdForUpdate(disputa.getContaDestino().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Conta de destino não encontrada"));

            contaDestino.unblockBalanceFromDispute(disputa.getValor());
            accountRepository.save(contaDestino);

            disputa.setStatus(DisputeStatus.RECUSADA);
        }

        disputa.setJustificativaAdmin(request.justificativa());
        disputa.setResolvidoPor(
                adminUser.getRole() == UserRole.OWNER ? DisputeResolvedBy.OWNER : DisputeResolvedBy.ADMIN);
        disputa.setResolvidoEm(LocalDateTime.now());

        return toResponseDTO(disputeRepository.save(disputa));
    }

    @Transactional(readOnly = true)
    public DisputeResponseDTO buscarPorId(UUID disputeId, UserModel usuarioLogado) {
        validateAuthenticatedUser(usuarioLogado);

        DisputeModel disputa = findDisputeOrThrow(disputeId);

        boolean isSolicitante = disputa.getContaSolicitante().getUser().getId().equals(usuarioLogado.getId());
        boolean isDestino = disputa.getContaDestino().getUser().getId().equals(usuarioLogado.getId());
        boolean isAdminOrOwner = usuarioLogado.getRole() == UserRole.ADMIN || usuarioLogado.getRole() == UserRole.OWNER;

        if (!isSolicitante && !isDestino && !isAdminOrOwner) {
            throw new AccessDeniedException("Você não tem permissão para visualizar esta disputa");
        }

        return toResponseDTO(disputa);
    }

    @Transactional(readOnly = true)
    public List<DisputeResponseDTO> listarMinhasDisputas(UserModel usuarioLogado) {
        validateAuthenticatedUser(usuarioLogado);

        AccountModel conta = accountRepository.findByUserId(usuarioLogado.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Conta bancária não encontrada para o usuário"));

        return disputeRepository
                .findAllByContaDestinoIdOrContaSolicitanteIdOrderByCriadoEmDesc(conta.getId(), conta.getId())
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DisputeResponseDTO> listarTodasDisputasAdmin(DisputeStatus status) {
        if (status != null) {
            return disputeRepository.findAllByStatusOrderByCriadoEmDesc(status)
                    .stream()
                    .map(this::toResponseDTO)
                    .toList();
        }
        return disputeRepository.findAllByOrderByCriadoEmDesc()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    private void executarEstornoFinanceiro(DisputeModel disputa) {
        UUID destinoId = disputa.getContaDestino().getId();
        UUID origemId = disputa.getContaSolicitante().getId();

        AccountModel contaDestino;
        AccountModel contaOrigem;

        if (destinoId.compareTo(origemId) < 0) {
            contaDestino = accountRepository.findByIdForUpdate(destinoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Conta de destino não encontrada"));
            contaOrigem = accountRepository.findByIdForUpdate(origemId)
                    .orElseThrow(() -> new ResourceNotFoundException("Conta de origem não encontrada"));
        } else {
            contaOrigem = accountRepository.findByIdForUpdate(origemId)
                    .orElseThrow(() -> new ResourceNotFoundException("Conta de origem não encontrada"));
            contaDestino = accountRepository.findByIdForUpdate(destinoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Conta de destino não encontrada"));
        }

        contaDestino.executeDisputeRefund(disputa.getValor());
        contaOrigem.credit(disputa.getValor());

        accountRepository.save(contaDestino);
        accountRepository.save(contaOrigem);

        PixTransaction transacaoOriginal = disputa.getTransacao();
        transacaoOriginal.setTransacaoEstornada(true);
        pixTransactionRepository.save(transacaoOriginal);

        PixTransaction estornoPix = PixTransaction.builder()
                .contaOrigemId(contaDestino.getId())
                .contaDestinoId(contaOrigem.getId())
                .valor(disputa.getValor())
                .descricao("Estorno Pix ref. disputa " + disputa.getIdDisputa())
                .build();

        pixTransactionRepository.save(estornoPix);
    }

    private DisputeModel findDisputeOrThrow(UUID disputeId) {
        return disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Disputa não encontrada: " + disputeId));
    }

    private void validateAuthenticatedUser(UserModel user) {
        if (user == null || user.getId() == null) {
            throw new InvalidDisputeOperationException("Usuário autenticado é obrigatório");
        }
    }

    private DisputeResponseDTO toResponseDTO(DisputeModel disputa) {
        return new DisputeResponseDTO(
                disputa.getIdDisputa(),
                disputa.getTransacao().getIdTransacao(),
                disputa.getContaSolicitante().getId(),
                disputa.getContaDestino().getId(),
                disputa.getValor(),
                disputa.getMotivoAbertura(),
                disputa.getJustificativaRecebedor(),
                disputa.getJustificativaAdmin(),
                disputa.getStatus(),
                disputa.getResolvidoPor(),
                disputa.getResolvidoEm(),
                disputa.getCriadoEm(),
                disputa.getAtualizadoEm());
    }
}
