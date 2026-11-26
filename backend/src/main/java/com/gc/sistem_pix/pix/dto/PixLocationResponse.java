package com.gc.sistem_pix.pix.dto;

import java.math.BigDecimal;

public record PixLocationResponse(
        BigDecimal latitude,
        BigDecimal longitude,
        BigDecimal accuracyMeters,
        PixLocationSource source
) {
}
