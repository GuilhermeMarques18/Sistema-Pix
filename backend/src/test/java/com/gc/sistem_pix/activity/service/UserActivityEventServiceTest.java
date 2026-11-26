package com.gc.sistem_pix.activity.service;

import com.gc.sistem_pix.activity.entity.UserActivityEvent;
import com.gc.sistem_pix.activity.enums.ActivityCategory;
import com.gc.sistem_pix.activity.enums.ActivityStatus;
import com.gc.sistem_pix.activity.repository.UserActivityEventRepository;
import com.gc.sistem_pix.user.entity.UserModel;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserActivityEventServiceTest {

    @Mock
    private UserActivityEventRepository events;

    @InjectMocks
    private UserActivityEventService service;

    @AfterEach
    void clearRequestContext() {
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void recordsLoginOutcomeWithRequestOrigin() {
        UUID userId = UUID.randomUUID();
        UserModel user = UserModel.builder().id(userId).build();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("203.0.113.8");
        request.addHeader("User-Agent", "SistemaPixTest/1.0");
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));

        service.recordLogin(user, true);
        service.recordLogin(user, false);
        service.recordActivity(user, "PIX_SENT", "Transferência Pix realizada.");

        ArgumentCaptor<UserActivityEvent> captor = ArgumentCaptor.forClass(UserActivityEvent.class);
        verify(events, org.mockito.Mockito.times(3)).save(captor.capture());
        List<UserActivityEvent> recorded = captor.getAllValues();
        assertEquals(userId, recorded.get(0).getUserId());
        assertEquals(ActivityCategory.LOGIN, recorded.get(0).getCategory());
        assertEquals("LOGIN_SUCCESS", recorded.get(0).getEventType());
        assertEquals(ActivityStatus.SUCCESS, recorded.get(0).getStatus());
        assertEquals("203.0.113.8", recorded.get(0).getIpAddress());
        assertEquals("SistemaPixTest/1.0", recorded.get(0).getUserAgent());
        assertEquals(ActivityStatus.FAILURE, recorded.get(1).getStatus());
        assertEquals(ActivityCategory.ACTIVITY, recorded.get(2).getCategory());
        assertEquals("PIX_SENT", recorded.get(2).getEventType());
        assertEquals(ActivityStatus.SUCCESS, recorded.get(2).getStatus());
    }

    @Test
    void queriesHistoryOnlyForRequestedUserAndFilters() {
        UUID userId = UUID.randomUUID();
        Instant createdAt = Instant.parse("2026-01-10T12:00:00Z");
        UserActivityEvent event = UserActivityEvent.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .category(ActivityCategory.ACTIVITY)
                .eventType("PIX_SENT")
                .status(ActivityStatus.SUCCESS)
                .description("Transferência Pix realizada.")
                .createdAt(createdAt)
                .build();
        when(events.findHistory(eq(userId), eq(ActivityCategory.ACTIVITY), eq("PIX_SENT"),
                any(Instant.class), any(Instant.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(event)));

        var result = service.findHistory(userId, ActivityCategory.ACTIVITY, "pix_sent",
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31), 0, 10);

        assertEquals(1, result.getTotalElements());
        assertEquals("PIX_SENT", result.getContent().get(0).eventType());
        assertEquals(createdAt, result.getContent().get(0).createdAt());
        verify(events).findHistory(eq(userId), eq(ActivityCategory.ACTIVITY), eq("PIX_SENT"),
                any(Instant.class), any(Instant.class), any(Pageable.class));
    }
}
