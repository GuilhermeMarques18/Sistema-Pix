package com.gc.sistem_pix.pix.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Objects;
import java.util.UUID;
import com.gc.sistem_pix.account.entity.AccountModel;
import com.gc.sistem_pix.account.repository.AccountRepository;
import com.gc.sistem_pix.pix.dto.*;
import com.gc.sistem_pix.pix.entity.ScheduledPix;
import com.gc.sistem_pix.pix.exception.InvalidPixTransactionException;
import com.gc.sistem_pix.pix.repository.ScheduledPixRepository;
import com.gc.sistem_pix.user.entity.UserModel;
import com.gc.sistem_pix.user.exception.DuplicateResourceException;
import com.gc.sistem_pix.user.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ScheduledPixService {
    private final ScheduledPixRepository schedules;
    private final AccountRepository accounts;
    private final PixTransactionService transfers;
    private final PixKeyService keys;
    private final PasswordEncoder passwords;

    @Transactional
    public ScheduledPixResponse create(ScheduledPixRequest request, UserModel user) {
        PixTransactionRequest transfer = request.transactionRequest();
        transfers.validateRequest(transfer, user);
        if (!user.isEnabled() || user.getPassword() == null || !passwords.matches(request.password(), user.getPassword())) {
            throw new InvalidPixTransactionException("Senha incorreta. Use a senha de acesso à sua conta.");
        }
        UUID sourceId = accounts.findAccountIdByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Conta bancária não encontrada"));
        AccountModel source = accounts.findByIdForUpdate(sourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Conta bancária não encontrada"));
        String key = PixKeyNormalizer.normalize(request.tipoChave(), request.chavePix());
        Instant when = request.scheduledAt().toInstant().truncatedTo(ChronoUnit.MICROS);
        var existing = schedules.findBySourceIdAndIdempotencyKey(sourceId, request.idempotencyKey());
        if (existing.isPresent()) {
            ScheduledPix s = existing.get();
            if (!s.getPixKey().equals(key) || s.getKeyType() != request.tipoChave()
                    || !s.getDestinationId().equals(request.contaDestinoId()) || s.getAmount().compareTo(request.valor()) != 0
                    || !Objects.equals(s.getDescription(), transfer.descricao()) || !s.getScheduledAt().equals(when)) {
                throw new DuplicateResourceException("Identificador de agendamento já utilizado com outros dados");
            }
            return response(s);
        }
        if (!when.isAfter(Instant.now())) throw new InvalidPixTransactionException("A data do agendamento deve ser futura");
        if (!source.isAvailableForPix()) throw new InvalidPixTransactionException("Conta de origem indisponível para Pix");
        var destination = keys.findByKeyForTransfer(request.tipoChave(), key).getAccount();
        if (!destination.getId().equals(request.contaDestinoId()) || sourceId.equals(destination.getId())) {
            throw new InvalidPixTransactionException("Destinatário inválido ou alterado");
        }
        ScheduledPix saved = schedules.save(ScheduledPix.builder().id(UUID.randomUUID()).sourceId(sourceId)
                .destinationId(request.contaDestinoId()).idempotencyKey(request.idempotencyKey()).pixKey(key)
                .keyType(request.tipoChave()).amount(request.valor().setScale(2)).description(transfer.descricao())
                .scheduledAt(when).status("PENDING").build());
        return response(saved);
    }

    @Transactional(readOnly = true)
    public ScheduledPixResponse get(UUID id, UserModel user) {
        ScheduledPix s = schedules.findById(id).orElseThrow(() -> new ResourceNotFoundException("Agendamento não encontrado"));
        UUID sourceId = accounts.findAccountIdByUserId(user.getId()).orElse(null);
        if (!s.getSourceId().equals(sourceId)) throw new org.springframework.security.access.AccessDeniedException("Agendamento de terceiros");
        return response(s);
    }

    private ScheduledPixResponse response(ScheduledPix s) {
        return new ScheduledPixResponse(s.getId(), s.getSourceId(), s.getDestinationId(), s.getPixKey(), s.getKeyType(),
                s.getAmount(), s.getDescription(), s.getScheduledAt(), s.getStatus(), s.getTransactionId(), s.getFailureReason());
    }
}