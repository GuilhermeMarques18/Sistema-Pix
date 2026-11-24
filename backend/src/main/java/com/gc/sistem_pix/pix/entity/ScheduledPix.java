package com.gc.sistem_pix.pix.entity;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import com.gc.sistem_pix.pix.enums.PixKeyType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "scheduled_pix")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ScheduledPix {
    @Id
    private UUID id;
    @Column(name = "source_id", nullable = false)
    private UUID sourceId;
    @Column(name = "destination_id", nullable = false)
    private UUID destinationId;
    @Column(name = "idempotency_key", nullable = false)
    private UUID idempotencyKey;
    @Column(name = "pix_key", nullable = false, length = 77)
    private String pixKey;
    @Enumerated(EnumType.STRING)
    @Column(name = "key_type", nullable = false, length = 20)
    private PixKeyType keyType;
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;
    @Column(length = 100)
    private String description;
    @Column(name = "scheduled_at", nullable = false)
    private Instant scheduledAt;
    @Column(nullable = false, length = 20)
    private String status;
    @Column(name = "transaction_id")
    private UUID transactionId;
    @Column(name = "failure_reason", length = 500)
    private String failureReason;
}