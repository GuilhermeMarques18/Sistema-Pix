package com.gc.sistem_pix.pix.service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;
import com.gc.sistem_pix.account.entity.AccountModel;
import com.gc.sistem_pix.account.repository.AccountRepository;
import com.gc.sistem_pix.pix.dto.ScheduledPixRequest;
import com.gc.sistem_pix.pix.dto.PixTransactionResponse;
import com.gc.sistem_pix.pix.entity.PixKey;
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
    @InjectMocks ScheduledPixService service;

    @Test
    void createsWithoutDebitingOrStoringPassword() {
        UUID userId = UUID.randomUUID(), sourceId = UUID.randomUUID(), destinationId = UUID.randomUUID();
        UserModel user = UserModel.builder().id(userId).password("hash").build();
        AccountModel source = AccountModel.builder().id(sourceId).user(user).balance(new BigDecimal("10.00")).build();
        AccountModel destination = AccountModel.builder().id(destinationId).build();
        ScheduledPixRequest request = new ScheduledPixRequest("destino@example.com", new BigDecimal("100.00"), null,
                PixKeyType.EMAIL, destinationId, "senha", UUID.randomUUID(), OffsetDateTime.now().plusHours(1));
        when(passwords.matches("senha", "hash")).thenReturn(true);
        when(accounts.findAccountIdByUserId(userId)).thenReturn(Optional.of(sourceId));
        when(accounts.findByIdForUpdate(sourceId)).thenReturn(Optional.of(source));
        when(keys.findByKeyForTransfer(PixKeyType.EMAIL, "destino@example.com")).thenReturn(PixKey.builder().account(destination).build());
        when(schedules.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        var response = service.create(request, user);
        assertEquals("PENDING", response.status());
        assertEquals(new BigDecimal("10.00"), source.getBalance());
        verify(transfers, never()).transfer(any(), any());
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
                .status("PENDING").scheduledAt(Instant.now().minusSeconds(1)).build();
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
}