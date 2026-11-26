package com.gc.sistem_pix.pix.entity;

import com.gc.sistem_pix.pix.dto.PixLocationDTO;
import com.gc.sistem_pix.pix.dto.PixLocationResponse;
import com.gc.sistem_pix.pix.dto.PixLocationSource;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PixLocationData {

    @Column(name = "location_latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "location_longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "location_accuracy_meters", precision = 10, scale = 2)
    private BigDecimal accuracyMeters;

    @Enumerated(EnumType.STRING)
    @Column(name = "location_source", length = 20)
    private PixLocationSource source;

    public static PixLocationData from(PixLocationDTO location) {
        if (location == null) {
            return null;
        }
        return PixLocationData.builder()
                .latitude(location.latitude())
                .longitude(location.longitude())
                .accuracyMeters(location.accuracyMeters())
                .source(location.source())
                .build();
    }

    public PixLocationResponse toResponse() {
        return new PixLocationResponse(latitude, longitude, accuracyMeters, source);
    }

    public boolean hasSameLocation(PixLocationData other) {
        return sameNumber(latitude, other.latitude)
                && sameNumber(longitude, other.longitude)
                && sameNumber(accuracyMeters, other.accuracyMeters)
                && source == other.source;
    }

    private boolean sameNumber(BigDecimal first, BigDecimal second) {
        return first == null ? second == null : second != null && first.compareTo(second) == 0;
    }
}
