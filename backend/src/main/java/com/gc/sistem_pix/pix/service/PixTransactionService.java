package com.gc.sistem_pix.pix.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.HexFormat;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.AccessDeniedException;
import com.gc.sistem_pix.account.entity.AccountModel;
import com.gc.sistem_pix.account.enums.AccountStatus;
import com.gc.sistem_pix.account.exception.AccountBlockedException;
import com.gc.sistem_pix.account.repository.AccountRepository;
import com.gc.sistem_pix.activity.service.UserActivityEventService;
import com.gc.sistem_pix.pix.dto.*;
import com.gc.sistem_pix.pix.entity.PixKey;
import com.gc.sistem_pix.pix.entity.PixLocationData;
import com.gc.sistem_pix.pix.entity.PixTransaction;
import com.gc.sistem_pix.pix.enums.TipoOperacaoPix;
import com.gc.sistem_pix.pix.event.PixTransferCompletedEvent;
import com.gc.sistem_pix.pix.exception.InvalidPixTransactionException;
import com.gc.sistem_pix.pix.exception.PixLimitExceededException;
import com.gc.sistem_pix.pix.repository.PixTransactionRepository;
import com.gc.sistem_pix.user.entity.UserModel;
import com.gc.sistem_pix.user.enums.UserRole;
import com.gc.sistem_pix.user.exception.ResourceNotFoundException;
import com.gc.sistem_pix.user.exception.DuplicateResourceException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PixTransactionService {
    private final PixTransactionRepository pixTransactionRepository;
    private final AccountRepository accountRepository;
    private final PixKeyService pixKeyService;
    private final PixRecipientService recipientService;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher events;
    private final UserActivityEventService activityEvents;

    @Transactional(noRollbackFor = PixLimitExceededException.class)
    public PixTransactionResponse create(PixTransactionRequest request, UserModel authenticatedUser) {
        validateRequest(request, authenticatedUser);
        if (!authenticatedUser.isEnabled() || authenticatedUser.getPassword() == null
                || !passwordEncoder.matches(request.password(), authenticatedUser.getPassword())) {
            throw new InvalidPixTransactionException("Senha incorreta. Use a senha de acesso à sua conta.");
        }

        return transfer(request, authenticatedUser.getId());
    }

    // Called inside the scheduling transaction after authentication at creation time.
    PixTransactionResponse transfer(PixTransactionRequest request, UUID userId) {
        String canonicalKey = PixKeyNormalizer.normalize(request.tipoChave(), request.chavePix());
        String fingerprint = fingerprint(request, canonicalKey);
        UUID sourceId = accountRepository.findAccountIdByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Conta bancária não encontrada para o usuário autenticado"));
        var previous = pixTransactionRepository.findByContaOrigemIdAndIdempotencyKey(sourceId, request.idempotencyKey());
        if (previous.isPresent()) return replay(previous.get(), fingerprint);

        // Serializa o envio com suspensão, desbloqueio e edição da mesma chave.
        PixKey destinationKey = pixKeyService.findByKeyForTransferForUpdate(request.tipoChave(), canonicalKey);
        UUID destinationId = destinationKey.getAccount().getId();
        if (!destinationId.equals(request.contaDestinoId())) throw new InvalidPixTransactionException("O titular da chave mudou. Confira o destinatário novamente.");
        if (sourceId.equals(destinationId)) throw new InvalidPixTransactionException("A conta de origem deve ser diferente da conta de destino");

        // A projeção de sourceId acima evita carregar saldo antes de adquirir as travas.
        AccountModel originAccount;
        AccountModel destinationAccount;
        if (sourceId.compareTo(destinationId) < 0) {
            originAccount = findAccountForUpdate(sourceId);
            destinationAccount = findAccountForUpdate(destinationId);
        } else {
            destinationAccount = findAccountForUpdate(destinationId);
            originAccount = findAccountForUpdate(sourceId);
        }

        // Outro pedido pode ter terminado enquanto esta requisição aguardava a trava.
        previous = pixTransactionRepository.findByContaOrigemIdAndIdempotencyKey(sourceId, request.idempotencyKey());
        if (previous.isPresent()) return replay(previous.get(), fingerprint);
        validateAccount(originAccount, "origem");
        validateAccount(destinationAccount, "destino");
        validateFraudLimits(originAccount, request.valor());
        PixRecipientResponse recipient = recipientService.describe(destinationKey);

        originAccount.debit(request.valor());
        destinationAccount.credit(request.valor());
        accountRepository.save(originAccount);
        accountRepository.save(destinationAccount);
        PixTransaction transaction = PixTransaction.builder()
                .contaOrigemId(sourceId)
                .contaDestinoId(destinationId)
                .valor(request.valor().setScale(2))
                .descricao(request.descricao())
                .idempotencyKey(request.idempotencyKey())
                .requestFingerprint(fingerprint)
                .chavePix(canonicalKey)
                .tipoChave(request.tipoChave())
                .nomeDestinatario(recipient.nome())
                .documentoDestinatarioMascarado(recipient.documentoMascarado())
                .location(PixLocationData.from(request.location()))
                .build();
        PixTransaction saved = pixTransactionRepository.saveAndFlush(transaction);
        activityEvents.recordActivity(originAccount.getUser(), "PIX_SENT", "Transferência Pix realizada.");
        events.publishEvent(new PixTransferCompletedEvent(originAccount.getUser(), destinationAccount.getUser(), saved));
        return toResponse(saved);
    }

    private void validateAccount(AccountModel account, String side) {
        if (!account.isAvailableForPix() || !account.getUser().isEnabled()) {
            if (account.getStatus() == AccountStatus.BLOQUEADA) throw new AccountBlockedException("Conta de " + side + " bloqueada");
            throw new InvalidPixTransactionException("Conta de " + side + " indisponível para Pix");
        }
    }

    private PixTransactionResponse replay(PixTransaction transaction, String fingerprint) {
        if (!fingerprint.equals(transaction.getRequestFingerprint())) throw new DuplicateResourceException("Identificador de envio já utilizado com outros dados");
        return toResponse(transaction);
    }

    private String fingerprint(PixTransactionRequest request, String key) {
        String content = String.join("\n", request.tipoChave().name(), key, request.contaDestinoId().toString(),
                request.valor().setScale(2).toPlainString(), request.descricao() == null ? "" : request.descricao());
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(content.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("Algoritmo de integridade indisponível", exception);
        }
    }

    @Transactional(readOnly = true)
    public PixTransactionResponse findById(UUID id, UserModel user) {
        PixTransaction transaction = pixTransactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transação Pix não encontrada"));
        UUID accountId = accountRepository.findAccountIdByUserId(user.getId()).orElse(null);
        boolean participant = transaction.getContaOrigemId().equals(accountId) || transaction.getContaDestinoId().equals(accountId);
        if (!participant && user.getRole() != UserRole.ADMIN && user.getRole() != UserRole.OWNER) throw new AccessDeniedException("Transação de terceiros");
        return toResponse(transaction);
    }

    @Transactional(readOnly = true)
    public List<PixTransactionResponse> findAll() {
        return pixTransactionRepository.findAllByOrderByDataHoraDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PixTransactionResponse> findAllByUserId(UUID userId) {
        AccountModel account = accountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Conta bancária não encontrada para este usuário"));

        return pixTransactionRepository
                .findAllByContaOrigemIdOrContaDestinoIdOrderByDataHoraDesc(
                        account.getId(),
                        account.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private AccountModel findAccountForUpdate(UUID accountId) {
        return accountRepository.findByIdForUpdate(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada: " + accountId));
    }

    void validateRequest(PixTransactionRequest request, UserModel user) {
        if (request == null || user == null || user.getId() == null) throw new InvalidPixTransactionException("Dados da transação e usuário autenticado são obrigatórios");
        if (request.tipoChave() == null || request.chavePix() == null || request.chavePix().isBlank()
                || request.chavePix().length() > 77 || request.contaDestinoId() == null || request.idempotencyKey() == null) {
            throw new InvalidPixTransactionException("Informe tipo, chave, destinatário confirmado e identificador de envio");
        }
        if (request.valor() == null || request.valor().signum() <= 0 || request.valor().scale() > 2
                || request.valor().precision() - request.valor().scale() > 17) throw new InvalidPixTransactionException("Informe valor positivo com até duas casas decimais");
        if (request.password() == null || request.password().isBlank() || request.password().getBytes(StandardCharsets.UTF_8).length > 72) throw new InvalidPixTransactionException("Informe sua senha de acesso");
        if (request.descricao() != null && request.descricao().length() > 100) throw new InvalidPixTransactionException("Descrição deve ter no máximo 100 caracteres");
    }

    private void validateFraudLimits(AccountModel originAccount, BigDecimal valor) {
        if (originAccount.getPixLimit() != null
                && originAccount.getPixLimit() > 0
                && valor.compareTo(BigDecimal.valueOf(originAccount.getPixLimit())) > 0) {
            originAccount.block();
            accountRepository.save(originAccount);
            throw new PixLimitExceededException(String.format(
                    "Suspeita de fraude: valor da transação (R$ %s) excede o limite Pix permitido (R$ %s)",
                    valor, originAccount.getPixLimit()));
        }

        if (originAccount.getTransactionLimit() != null && originAccount.getTransactionLimit() > 0) {
            LocalDateTime inicioDoDia = LocalDate.now().atStartOfDay();
            LocalDateTime fimDoDia = LocalDate.now().atTime(LocalTime.MAX);
            long transacoesHoje = pixTransactionRepository
                    .countByContaOrigemIdAndDataHoraBetween(originAccount.getId(), inicioDoDia, fimDoDia);

            if (transacoesHoje >= originAccount.getTransactionLimit()) {
                originAccount.block();
                accountRepository.save(originAccount);
                throw new PixLimitExceededException(String.format(
                        "Suspeita de fraude: limite diário de transações (%d) atingido",
                        originAccount.getTransactionLimit()));
            }
        }
    }

    private PixTransactionResponse toResponse(PixTransaction transaction) {
        return new PixTransactionResponse(
                transaction.getIdTransacao(),
                transaction.getContaOrigemId(),
                transaction.getContaDestinoId(),
                transaction.getDescricao(),
                transaction.getValor(),
                transaction.getDataHora(),
                transaction.getChavePix(),
                transaction.getTipoChave(),
                transaction.getNomeDestinatario(),
                transaction.getDocumentoDestinatarioMascarado(),
                transaction.getLocation() == null ? null : transaction.getLocation().toResponse());
    }

    @Transactional(readOnly = true)
    public PixExtractResponse gerarExtrato(UserModel authenticatedUser, LocalDate dataInicio, LocalDate dataFim) {
        if (authenticatedUser == null || authenticatedUser.getId() == null) {
            throw new InvalidPixTransactionException("Usuário autenticado é obrigatório");
        }

        AccountModel account = accountRepository.findByUserId(authenticatedUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Conta bancária não encontrada para o usuário autenticado"));

        LocalDateTime inicio = resolveInicioPeriodo(dataInicio);
        LocalDateTime fim = resolveFimPeriodo(dataFim);

        if (inicio.isAfter(fim)) {
            throw new InvalidPixTransactionException("A data inicial não pode ser posterior à data final");
        }

        List<PixTransaction> transacoes = pixTransactionRepository
                .findAllByContaIdAndPeriodo(account.getId(), inicio, fim);

        List<PixExtractItemResponse> itens = transacoes.stream()
                .map(transacao -> toExtractItem(transacao, account.getId()))
                .toList();

        BigDecimal totalEntradas = somarPorTipo(itens, TipoOperacaoPix.ENTRADA);
        BigDecimal totalSaidas = somarPorTipo(itens, TipoOperacaoPix.SAIDA);

        return new PixExtractResponse(inicio, fim, totalEntradas, totalSaidas, itens);
    }

    private LocalDateTime resolveInicioPeriodo(LocalDate dataInicio) {
        // Sem data informada: extrato completo (sem limite inferior relevante)
        return dataInicio != null ? dataInicio.atStartOfDay() : LocalDateTime.of(1970, 1, 1, 0, 0);
    }

    private LocalDateTime resolveFimPeriodo(LocalDate dataFim) {
        LocalDate referencia = dataFim != null ? dataFim : LocalDate.now();
        return LocalDateTime.of(referencia, LocalTime.MAX);
    }

    private PixExtractItemResponse toExtractItem(PixTransaction transacao, UUID contaId) {
        boolean isOrigem = transacao.getContaOrigemId().equals(contaId);
        TipoOperacaoPix tipo = isOrigem ? TipoOperacaoPix.SAIDA : TipoOperacaoPix.ENTRADA;
        UUID contraparte = isOrigem ? transacao.getContaDestinoId() : transacao.getContaOrigemId();

        return new PixExtractItemResponse(
                transacao.getIdTransacao(),
                transacao.getDataHora(),
                tipo,
                transacao.getValor(),
                transacao.getDescricao(),
                contraparte,
                transacao.getLocation() == null ? null : transacao.getLocation().toResponse());
    }

    private BigDecimal somarPorTipo(List<PixExtractItemResponse> itens, TipoOperacaoPix tipo) {
        return itens.stream()
                .filter(item -> item.tipo() == tipo)
                .map(PixExtractItemResponse::valor)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
