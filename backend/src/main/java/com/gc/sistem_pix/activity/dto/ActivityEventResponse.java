package com.gc.sistem_pix.activity.dto;

import com.gc.sistem_pix.activity.enums.ActivityCategory;
import com.gc.sistem_pix.activity.enums.ActivityStatus;

import java.time.Instant;
import java.util.UUID;

public record ActivityEventResponse(
        UUID id,
        ActivityCategory category,
        String eventType,
        ActivityStatus status,
        String description,
        String ipAddress,
        String userAgent,
        Instant createdAt
) {
}
