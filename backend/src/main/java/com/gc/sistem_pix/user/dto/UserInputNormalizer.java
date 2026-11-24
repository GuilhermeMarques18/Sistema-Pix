package com.gc.sistem_pix.user.dto;

import java.util.Locale;

/** Normalização antes da validação e das consultas de unicidade. */
public final class UserInputNormalizer {

    private UserInputNormalizer() {}

    public static String name(String value) {
        return value == null ? null : value.trim();
    }

    public static String email(String value) {
        return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
    }

    public static String phone(String value) {
        return value == null ? null : value.trim().replaceAll("[\\s()\\-]", "");
    }

    public static String document(String value) {
        return value == null ? null : value.replaceAll("[.\\/\\s\\-]", "");
    }
}
