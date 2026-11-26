package com.gc.sistem_pix.pix.service;

import java.time.Instant;
import java.util.UUID;
import com.gc.sistem_pix.account.exception.AccountBlockedException;
import com.gc.sistem_pix.account.exception.InsufficientBalanceException;
import com.gc.sistem_pix.account.repository.AccountRepository;
import com.gc.sistem_pix.pix.dto.PixTransactionRequest;
import com.gc.sistem_pix.pix.entity.ScheduledPix;
import com.gc.sistem_pix.pix.exception.InvalidPixKeyException;
import com.gc.sistem_pix.pix.exception.InvalidPixTransactionException;
import com.gc.sistem_pix.pix.exception.PixLimitExceededException;
import com.gc.sistem_pix.pix.repository.ScheduledPixRepository;
import com.gc.sistem_pix.user.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionTemplate;

@Component
@RequiredArgsConstructor
@Slf4j
public class ScheduledPixExecutor {
    private final ScheduledPixRepository schedules;
    private final AccountRepository accounts;
    private final PixTransactionService transfers;
    private final TransactionTemplate transactions;

    @Scheduled(fixedDelayString = "${app.pix.scheduled-poll-ms:10000}")
    public void poll() {
        var due = schedules.findByStatusAndScheduledAtLessThanEqualOrderByScheduledAtAsc("PENDING", Instant.now(), PageRequest.of(0, 100));
        for (ScheduledPix schedule : due) {
            try {
                transactions.executeWithoutResult(status -> execute(schedule.getId()));
            } catch (InvalidPixTransactionException | InvalidPixKeyException | AccountBlockedException
                    | InsufficientBalanceException | ResourceNotFoundException exception) {
                transactions.executeWithoutResult(status -> fail(schedule.getId(), exception.getMessage()));
            } catch (RuntimeException exception) {
                log.error("Erro temporário ao executar Pix agendado {}", schedule.getId(), exception);
            }
        }
    }

    void execute(UUID id) {
        ScheduledPix s = schedules.findForUpdate(id).orElseThrow();
        if (!s.getStatus().equals("PENDING") || s.getScheduledAt().isAfter(Instant.now())) return;
        UUID userId = accounts.findUserIdByAccountId(s.getSourceId()).orElseThrow(() -> new ResourceNotFoundException("Conta de origem não encontrada"));
        PixTransactionRequest request = new PixTransactionRequest(s.getPixKey(), s.getAmount(), s.getDescription(),
                s.getKeyType(), s.getDestinationId(), null, s.getId(),
                s.getLocation() == null ? null : new com.gc.sistem_pix.pix.dto.PixLocationDTO(
                        s.getLocation().getLatitude(),
                        s.getLocation().getLongitude(),
                        s.getLocation().getAccuracyMeters(),
                        s.getLocation().getSource()));
        try {
            var result = transfers.transfer(request, userId);
            s.setTransactionId(result.idTransacao());
            s.setStatus("COMPLETED");
        } catch (PixLimitExceededException exception) {
            s.setStatus("FAILED");
            s.setFailureReason(exception.getMessage());
        }
    }

    void fail(UUID id, String reason) {
        ScheduledPix s = schedules.findForUpdate(id).orElseThrow();
        if (s.getStatus().equals("PENDING")) {
            s.setStatus("FAILED");
            s.setFailureReason(reason == null ? "Falha na execução" : reason.substring(0, Math.min(500, reason.length())));
        }
    }
}