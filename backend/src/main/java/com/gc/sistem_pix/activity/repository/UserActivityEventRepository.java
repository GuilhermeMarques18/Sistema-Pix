package com.gc.sistem_pix.activity.repository;

import com.gc.sistem_pix.activity.entity.UserActivityEvent;
import com.gc.sistem_pix.activity.enums.ActivityCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.UUID;

public interface UserActivityEventRepository extends JpaRepository<UserActivityEvent, UUID> {

    @Query("""
            SELECT event FROM UserActivityEvent event
            WHERE event.userId = :userId
              AND event.category = :category
              AND (:eventType IS NULL OR event.eventType = :eventType)
              AND (:fromTime IS NULL OR event.createdAt >= :fromTime)
              AND (:untilExclusive IS NULL OR event.createdAt < :untilExclusive)
            """)
    Page<UserActivityEvent> findHistory(
            @Param("userId") UUID userId,
            @Param("category") ActivityCategory category,
            @Param("eventType") String eventType,
            @Param("fromTime") Instant fromTime,
            @Param("untilExclusive") Instant untilExclusive,
            Pageable pageable);
}
