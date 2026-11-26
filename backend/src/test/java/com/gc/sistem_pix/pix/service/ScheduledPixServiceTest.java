package com.gc.sistem_pix.pix.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.gc.sistem_pix.account.entity.AccountModel;
import com.gc.sistem_pix.account.repository.AccountRepository;
import com.gc.sistem_pix.activity.service.UserActivityEventService;
import com.gc.sistem_pix.pix.dto.ScheduledPixRequest;
import com.gc.sistem_pix.pix.dto.PixTransactionResponse;
import com.gc.sistem_pix.pix.dto.PixTransactionRequest;
import com.gc.sistem_pix.pix.dto.PixLocationDTO;
import com.gc.sistem_pix.pix.dto.PixLocationSource;
import com.gc.sistem_pix.pix.dto.UpdateScheduledPixRequest;
import com.gc.sistem_pix.pix.entity.PixKey;
import com.gc.sistem_pix.pix.entity.PixLocationData;
import com.gc.sistem_pix.pix.entity.ScheduledPix;
import com.gc.sistem_pix.pix.enums.PixKeyType;
import com.gc.sistem_pix.pix.exception.InvalidPixTransactionException;
import com.gc.sistem_pix.pix.repository.ScheduledPixRepository;
import com.gc.sistem_pix.user.entity.UserModel;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.support.TransactionTemplate;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScheduledPixServiceTest {
    @Mock ScheduledPixRepository schedules;
    @Mock AccountRepository accounts;
    @Mock PixTransactionService transfers;
    @Mock PixKeyService keys;
    @Mock PasswordEncoder passwords;
    @Mock UserActivityEventService activityEvents;
    @InjectMocks ScheduledPixService service;

    @Test
    void createsWithoutDebitingOrStoringPassword() {
        UUID userId = UUID.randomUUID(), sourceId = UUID.randomUUID(), destinationId = UUID.randomUUID();
        UserModel user = UserModel.builder().id(userId).password("hash").build();
        AccountModel source = AccountModel.builder().id(sourceId).user(user).balance(new BigDecimal("10.00")).build();
        AccountModel destination = AccountModel.builder().id(destinationId).build();
        PixLocationDTO location = new PixLocationDTO(new BigDecimal("-23.55"), new BigDecimal("-46.63"),
                new BigDecimal("20"), PixLocationSource.BROWSER);
        ScheduledPixRequest request = new ScheduledPixRequest("destino@example.com", new BigDecimal("100.00"), null,
                PixKeyType.EMAIL, destinationId, "senha", UUID.randomUUID(), OffsetDateTime.now().plusHours(1), location);
        when(passwords.matches("senha", "hash")).thenReturn(true);
        when(accounts.findAccountIdByUserId(userId)).thenReturn(Optional.of(sourceId));
        when(accounts.findByIdForUpdate(sourceId)).thenReturn(Optional.of(source));
        when(keys.findByKeyForTransfer(PixKeyType.EMAIL, "destino@example.com")).thenReturn(PixKey.builder().account(destination).build());
        when(schedules.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        var response = service.create(request, user);
        assertEquals("PENDING", response.status());
        assertEquals(new BigDecimal("10.00"), source.getBalance());
        verify(transfers, never()).transfer(any(), any());
        org.mockito.ArgumentCaptor<ScheduledPix> saved = org.mockito.ArgumentCaptor.forClass(ScheduledPix.class);
        verify(schedules).save(saved.capture());
        assertEquals(location.latitude(), saved.getValue().getLocation().getLatitude());
        assertEquals(location.longitude(), saved.getValue().getLocation().getLongitude());
        assertFalse(response.toString().contains("senha"));
    }

    @Test
    void rejectsWrongPasswordBeforePersistence() {
        UserModel user = UserModel.builder().id(UUID.randomUUID()).password("hash").build();
        ScheduledPixRequest request = new ScheduledPixRequest("destino@example.com", BigDecimal.ONE, null,
                PixKeyType.EMAIL, UUID.randomUUID(), "wrong", UUID.randomUUID(), OffsetDateTime.now().plusDays(1));
        assertThrows(InvalidPixTransactionException.class, () -> service.create(request, user));
        verifyNoInteractions(schedules, accounts);
    }

    @Test
    void executorDoesNotExecuteFutureOrCompletedItemsAndRecordsFailure() {
        ScheduledPixExecutor executor = new ScheduledPixExecutor(schedules, accounts, transfers, mock(TransactionTemplate.class));
        UUID id = UUID.randomUUID();
        ScheduledPix schedule = ScheduledPix.builder().id(id).status("PENDING").scheduledAt(Instant.now().plusSeconds(60)).build();
        when(schedules.findForUpdate(id)).thenReturn(Optional.of(schedule));
        executor.execute(id);
        verifyNoInteractions(transfers, accounts);
        executor.fail(id, "Saldo insuficiente");
        assertEquals("FAILED", schedule.getStatus());
        assertEquals("Saldo insuficiente", schedule.getFailureReason());
        executor.execute(id);
        verifyNoInteractions(transfers, accounts);
    }

    @Test
    void executesDueItemOnlyOnce() {
        ScheduledPixExecutor executor = new ScheduledPixExecutor(schedules, accounts, transfers, mock(TransactionTemplate.class));
        UUID id = UUID.randomUUID(), sourceId = UUID.randomUUID(), userId = UUID.randomUUID(), transactionId = UUID.randomUUID();
        ScheduledPix schedule = ScheduledPix.builder().id(id).sourceId(sourceId).destinationId(UUID.randomUUID())
                .pixKey("destino@example.com").keyType(PixKeyType.EMAIL).amount(BigDecimal.ONE)
                .status("PENDING").scheduledAt(Instant.now().minusSeconds(1))
                .location(PixLocationData.from(new PixLocationDTO(new BigDecimal("-23.55"), new BigDecimal("-46.63"),
                        new BigDecimal("20"), PixLocationSource.BROWSER))).build();
        when(schedules.findForUpdate(id)).thenReturn(Optional.of(schedule));
        when(accounts.findUserIdByAccountId(sourceId)).thenReturn(Optional.of(userId));
        PixTransactionResponse result = mock(PixTransactionResponse.class);
        when(result.idTransacao()).thenReturn(transactionId);
        when(transfers.transfer(any(), eq(userId))).thenReturn(result);
        executor.execute(id);
        executor.execute(id);
        assertEquals("COMPLETED", schedule.getStatus());
        assertEquals(transactionId, schedule.getTransactionId());
        verify(transfers, times(1)).transfer(any(), eq(userId));
        org.mockito.ArgumentCaptor<PixTransactionRequest> transferRequest = org.mockito.ArgumentCaptor.forClass(PixTransactionRequest.class);
        verify(transfers).transfer(transferRequest.capture(), eq(userId));
        assertEquals(schedule.getLocation().getLatitude(), transferRequest.getValue().location().latitude());
    }

    @Test
    void rejectsPastDate() {
        UUID userId = UUID.randomUUID(), sourceId = UUID.randomUUID();
        UserModel user = UserModel.builder().id(userId).password("hash").build();
        ScheduledPixRequest request = new ScheduledPixRequest("destino@example.com", BigDecimal.ONE, null,
                PixKeyType.EMAIL, UUID.randomUUID(), "senha", UUID.randomUUID(), OffsetDateTime.now().minusSeconds(1));
        when(passwords.matches("senha", "hash")).thenReturn(true);
        when(accounts.findAccountIdByUserId(userId)).thenReturn(Optional.of(sourceId));
        when(accounts.findByIdForUpdate(sourceId)).thenReturn(Optional.of(AccountModel.builder().id(sourceId).build()));
        assertThrows(InvalidPixTransactionException.class, () -> service.create(request, user));
        verify(schedules, never()).save(any());
    }

    @Test
    void listsOnlyPendingSchedulesForTheAuthenticatedUsersAccount() {
        UUID userId = UUID.randomUUID(), sourceId = UUID.randomUUID();
        UserModel user = UserModel.builder().id(userId).build();
        ScheduledPix pending = ScheduledPix.builder().id(UUID.randomUUID()).sourceId(sourceId)
                .destinationId(UUID.randomUUID()).pixKey("recipient@example.com").status("PENDING")
                .scheduledAt(Instant.now().plusSeconds(3600)).amount(BigDecimal.TEN).build();
        when(accounts.findAccountIdByUserId(userId)).thenReturn(Optional.of(sourceId));
        when(schedules.findBySourceIdAndStatusOrderByScheduledAtAsc(sourceId, "PENDING")).thenReturn(List.of(pending));

        var result = service.findPendingByUser(user);

        assertEquals(1, result.size());
        assertEquals(pending.getId(), result.get(0).id());
        verify(schedules).findBySourceIdAndStatusOrderByScheduledAtAsc(sourceId, "PENDING");
    }

    @Test
    void updatesPendingScheduleFieldsForItsOwner() {
        UUID userId = UUID.randomUUID(), sourceId = UUID.randomUUID(), id = UUID.randomUUID();
        UserModel user = UserModel.builder().id(userId).build();
        ScheduledPix pending = ScheduledPix.builder().id(id).sourceId(sourceId).destinationId(UUID.randomUUID())
                .pixKey("recipient@example.com").status("PENDING").scheduledAt(Instant.now().plusSeconds(3600))
                .amount(BigDecimal.ONE).build();
        when(accounts.findAccountIdByUserId(userId)).thenReturn(Optional.of(sourceId));
        when(schedules.findForUpdate(id)).thenReturn(Optional.of(pending));
        UpdateScheduledPixRequest request = new UpdateScheduledPixRequest(new BigDecimal("25.50"),
                OffsetDateTime.now().plusDays(2), "Aluguel");

        var result = service.update(id, request, user);

        assertEquals(new BigDecimal("25.50"), result.valor());
        assertEquals("Aluguel", result.descricao());
        assertEquals(request.scheduledAt().toInstant().truncatedTo(java.time.temporal.ChronoUnit.MICROS), result.scheduledAt());
        assertEquals("PENDING", result.status());
    }

    @Test
    void cancellationStopsPendingScheduleAndRejectsNonPendingOrForeignSchedules() {
        UUID userId = UUID.randomUUID(), sourceId = UUID.randomUUID(), scheduleId = UUID.randomUUID();
        UserModel user = UserModel.builder().id(userId).build();
        ScheduledPix pending = ScheduledPix.builder().id(scheduleId).sourceId(sourceId)
                .status("PENDING").scheduledAt(Instant.now().plusSeconds(3600)).build();
        when(accounts.findAccountIdByUserId(userId)).thenReturn(Optional.of(sourceId));
        when(schedules.findForUpdate(scheduleId)).thenReturn(Optional.of(pending));

        service.cancel(scheduleId, user);
        assertEquals("CANCELLED", pending.getStatus());

        pending.setStatus("COMPLETED");
        assertThrows(InvalidPixTransactionException.class, () -> service.cancel(scheduleId, user));

        pending.setStatus("PENDING");
        when(accounts.findAccountIdByUserId(userId)).thenReturn(Optional.of(UUID.randomUUID()));
        assertThrows(org.springframework.security.access.AccessDeniedException.class, () -> service.cancel(scheduleId, user));
    }

    @Test
    void rejectsUpdateWhenScheduleIsNoLongerPending() {
        UUID userId = UUID.randomUUID(), sourceId = UUID.randomUUID(), id = UUID.randomUUID();
        UserModel user = UserModel.builder().id(userId).build();
        ScheduledPix completed = ScheduledPix.builder().id(id).sourceId(sourceId).status("COMPLETED").build();
        when(accounts.findAccountIdByUserId(userId)).thenReturn(Optional.of(sourceId));
        when(schedules.findForUpdate(id)).thenReturn(Optional.of(completed));

        assertThrows(InvalidPixTransactionException.class,
                () -> service.update(id, new UpdateScheduledPixRequest(BigDecimal.ONE, OffsetDateTime.now().plusDays(1), null), user));
    }
}