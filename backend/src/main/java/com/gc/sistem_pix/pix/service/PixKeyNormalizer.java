package com.gc.sistem_pix.pix.service;

import java.util.Locale;
import java.util.UUID;
import com.gc.sistem_pix.pix.enums.PixKeyType;
import com.gc.sistem_pix.pix.exception.InvalidPixKeyException;

public final class PixKeyNormalizer {
    private PixKeyNormalizer() {}

    public static String normalize(PixKeyType type, String key) {
        if (type == null || key == null || key.isBlank()) throw new InvalidPixKeyException("Tipo e valor da chave Pix são obrigatórios");
        String value = key.trim();
        return switch (type) {
            case CPF, CNPJ -> document(type, value);
            case EMAIL -> {
                String email = value.toLowerCase(Locale.ROOT);
                if (email.length() > 77 || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) throw new InvalidPixKeyException("E-mail inválido");
                yield email;
            }
            case CELULAR -> {
                String phone = value.replaceAll("[\\s()\\-]", "");
                if (!phone.matches("\\+?[0-9]{10,13}")) throw new InvalidPixKeyException("Telefone inválido");
                if (!phone.startsWith("+")) phone = "+" + (phone.length() <= 11 ? "55" : "") + phone;
                yield phone;
            }
            case ALEATORIO -> {
                if (!value.matches("(?i)[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")) throw new InvalidPixKeyException("Chave aleatória deve ser um UUID válido");
                yield UUID.fromString(value).toString();
            }
        };
    }

    private static String document(PixKeyType type, String value) {
        String digits = value.replaceAll("[.\\/\\s\\-]", "");
        int length = type == PixKeyType.CPF ? 11 : 14;
        if (!digits.matches("[0-9]{" + length + "}") || digits.chars().distinct().count() == 1) throw new InvalidPixKeyException(type + " inválido");
        String base = digits.substring(0, length - 2);
        int first = digit(base, type == PixKeyType.CPF);
        int second = digit(base + first, type == PixKeyType.CPF);
        if (!digits.equals(base + first + second)) throw new InvalidPixKeyException(type + " inválido");
        return digits;
    }

    private static int digit(String base, boolean cpf) {
        int factor = cpf ? base.length() + 1 : base.length() - 7;
        int sum = 0;
        for (char number : base.toCharArray()) {
            sum += (number - '0') * factor--;
            if (!cpf && factor < 2) factor = 9;
        }
        int remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    }
}
