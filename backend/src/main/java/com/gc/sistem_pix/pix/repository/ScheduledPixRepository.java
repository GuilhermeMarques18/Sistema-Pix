package com.gc.sistem_pix.pix.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.gc.sistem_pix.pix.entity.ScheduledPix;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface ScheduledPixRepository extends JpaRepository<ScheduledPix, UUID> {
    Optional<ScheduledPix> findBySourceIdAndIdempotencyKey(UUID sourceId, UUID key);
    List<ScheduledPix> findBySourceIdAndStatusOrderByScheduledAtAsc(UUID sourceId, String status);
    List<ScheduledPix> findByStatusAndScheduledAtLessThanEqualOrderByScheduledAtAsc(String status, Instant now, Pageable page);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from ScheduledPix s where s.id = :id")
    Optional<ScheduledPix> findForUpdate(@Param("id") UUID id);
}