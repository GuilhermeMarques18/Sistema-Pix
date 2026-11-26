package com.gc.sistem_pix.pix.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record UpdateScheduledPixRequest(
        @NotNull @Positive @Digits(integer = 17, fraction = 2) BigDecimal valor,
        @NotNull OffsetDateTime scheduledAt,
        @Size(max = 100) String descricao) {}
