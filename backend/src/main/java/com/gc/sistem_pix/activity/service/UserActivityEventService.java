package com.gc.sistem_pix.activity.service;

import com.gc.sistem_pix.activity.dto.ActivityEventResponse;
import com.gc.sistem_pix.activity.entity.UserActivityEvent;
import com.gc.sistem_pix.activity.enums.ActivityCategory;
import com.gc.sistem_pix.activity.enums.ActivityStatus;
import com.gc.sistem_pix.activity.repository.UserActivityEventRepository;
import com.gc.sistem_pix.user.entity.UserModel;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserActivityEventService {

    private static final int MAX_PAGE_SIZE = 100;
    private final UserActivityEventRepository events;

    @Transactional
    public void recordLogin(UserModel user, boolean successful) {
        record(
                user,
                ActivityCategory.LOGIN,
                successful ? "LOGIN_SUCCESS" : "LOGIN_FAILED",
                successful ? ActivityStatus.SUCCESS : ActivityStatus.FAILURE,
                successful ? "Login realizado com sucesso." : "Tentativa de login malsucedida.");
    }

    @Transactional
    public void recordActivity(UserModel user, String eventType, String description) {
        record(user, ActivityCategory.ACTIVITY, eventType, ActivityStatus.SUCCESS, description);
    }

    @Transactional(readOnly = true)
    public Page<ActivityEventResponse> findHistory(
            UUID userId,
            ActivityCategory category,
            String eventType,
            LocalDate from,
            LocalDate until,
            int page,
            int size) {
        if (userId == null) {
            throw new IllegalArgumentException("Usuário autenticado é obrigatório.");
        }
        if (page < 0 || size < 1) {
            throw new IllegalArgumentException("A página deve ser positiva e o tamanho maior que zero.");
        }
        if (from != null && until != null && from.isAfter(until)) {
            throw new IllegalArgumentException("A data inicial não pode ser posterior à data final.");
        }

        int boundedSize = Math.min(size, MAX_PAGE_SIZE);
        Pageable pageable = PageRequest.of(page, boundedSize, Sort.by(Sort.Direction.DESC, "createdAt"));
        return events.findHistory(
                        userId,
                        category,
                        eventType == null || eventType.isBlank() ? null : eventType.trim().toUpperCase(Locale.ROOT),
                        from == null ? null : from.atStartOfDay().toInstant(ZoneOffset.UTC),
                        until == null ? null : until.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC),
                        pageable)
                .map(this::toResponse);
    }

    private void record(
            UserModel user,
            ActivityCategory category,
            String eventType,
            ActivityStatus status,
            String description) {
        if (user == null || user.getId() == null) {
            throw new IllegalArgumentException("Usuário do evento é obrigatório.");
        }
        HttpServletRequest request = currentRequest();
        events.save(UserActivityEvent.builder()
                .userId(user.getId())
                .category(category)
                .eventType(eventType)
                .status(status)
                .description(description)
                .ipAddress(request == null ? null : truncate(request.getRemoteAddr(), 45))
                .userAgent(request == null ? null : truncate(request.getHeader("User-Agent"), 512))
                .build());
    }

    private HttpServletRequest currentRequest() {
        if (RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes) {
            return attributes.getRequest();
        }
        return null;
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }

    private ActivityEventResponse toResponse(UserActivityEvent event) {
        return new ActivityEventResponse(
                event.getId(),
                event.getCategory(),
                event.getEventType(),
                event.getStatus(),
                event.getDescription(),
                event.getIpAddress(),
                event.getUserAgent(),
                event.getCreatedAt());
    }
}
