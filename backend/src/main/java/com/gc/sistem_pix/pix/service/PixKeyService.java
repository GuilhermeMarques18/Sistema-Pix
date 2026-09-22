package com.gc.sistem_pix.pix.service;

import com.gc.sistem_pix.account.entity.AccountModel;
import com.gc.sistem_pix.account.repository.AccountRepository;
import com.gc.sistem_pix.pix.dto.CreatePixKeyRequest;
import com.gc.sistem_pix.pix.dto.PixKeyResponse;
import com.gc.sistem_pix.pix.dto.PixKeyValidationResponse;
import com.gc.sistem_pix.pix.entity.PixKey;
import com.gc.sistem_pix.pix.enums.PixKeyType;
import com.gc.sistem_pix.pix.exception.InvalidPixKeyException;
import com.gc.sistem_pix.pix.repository.PixKeyRepository;
import com.gc.sistem_pix.user.entity.UserModel;
import com.gc.sistem_pix.user.exception.ResourceNotFoundException;
import com.gc.sistem_pix.user.repository.PessoaFisicaRepository;
import com.gc.sistem_pix.user.repository.PessoaJuridicaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class PixKeyService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\+?[0-9]{10,13}$");

    private final PixKeyRepository pixKeyRepository;
    private final AccountRepository accountRepository;
    private final PessoaFisicaRepository pessoaFisicaRepository;
    private final PessoaJuridicaRepository pessoaJuridicaRepository;

    @Transactional
    public PixKeyResponse create(CreatePixKeyRequest request, UserModel authenticatedUser) {
        if (request == null || request.tipo() == null || authenticatedUser == null
                || authenticatedUser.getId() == null) {
            throw new InvalidPixKeyException("Tipo da chave Pix é obrigatório");
        }

        AccountModel account = accountRepository.findByUserId(authenticatedUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Conta bancária não encontrada para o usuário"));

        String normalizedKey = normalizeAndValidate(request.tipo(), request.chave(), authenticatedUser);

        if (pixKeyRepository.existsByAccount_IdAndType(account.getId(), request.tipo())) {
            throw new InvalidPixKeyException(
                    "A conta já possui uma chave Pix deste tipo");
        }

        if (pixKeyRepository.existsByKey(normalizedKey)) {
            throw new InvalidPixKeyException("Chave Pix já cadastrada");
        }

        PixKey pixKey = PixKey.builder()
                .account(account)
                .type(request.tipo())
                .key(normalizedKey)
                .build();

        return toResponse(pixKeyRepository.save(pixKey));
    }

    @Transactional(readOnly = true)
    public PixKeyValidationResponse validate(PixKeyType type, String key) {
        String normalizedKey = normalizeAndValidateFormat(type, key);
        Optional<PixKey> pixKey = pixKeyRepository.findByKey(normalizedKey);

        return new PixKeyValidationResponse(
                true,
                pixKey.isPresent(),
                type,
                normalizedKey,
                pixKey.map(value -> value.getAccount().getId()).orElse(null));
    }

    @Transactional(readOnly = true)
    public PixKey findByKeyForTransfer(String key) {
        String normalizedKey = normalizeKeyForLookup(key);

        return pixKeyRepository.findByKey(normalizedKey)
                .orElseThrow(() -> new ResourceNotFoundException("Chave Pix não encontrada"));
    }

    @Transactional(readOnly = true)
    public List<PixKeyResponse> findAll() {
        return pixKeyRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PixKeyResponse> findAllByUserId(UUID userId) {
        AccountModel account = accountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Conta bancária não encontrada para este usuário"));

        return pixKeyRepository.findAllByAccount_IdOrderByCreatedAtDesc(account.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private String normalizeAndValidate(
            PixKeyType type,
            String key,
            UserModel authenticatedUser) {
        if (type == PixKeyType.ALEATORIO) {
            if (key != null && !key.isBlank()) {
                throw new InvalidPixKeyException(
                        "A chave aleatória não deve possuir valor informado");
            }

            return UUID.randomUUID().toString();
        }

        String normalizedKey = normalizeAndValidateFormat(type, key);
        validateOwnership(type, normalizedKey, authenticatedUser);
        return normalizedKey;
    }

    private String normalizeAndValidateFormat(PixKeyType type, String key) {
        if (type == null || key == null || key.isBlank()) {
            throw new InvalidPixKeyException("Tipo e valor da chave Pix são obrigatórios");
        }

        return switch (type) {
            case CPF -> validateCpf(key);
            case CNPJ -> validateCnpj(key);
            case EMAIL -> validateEmail(key);
            case CELULAR -> validatePhone(key);
            case ALEATORIO -> key.trim();
        };
    }

    private String normalizeKeyForLookup(String key) {
        if (key == null || key.isBlank()) {
            throw new InvalidPixKeyException("Chave Pix de destino é obrigatória");
        }

        String value = key.trim();
        String email = value.toLowerCase(Locale.ROOT);

        if (EMAIL_PATTERN.matcher(email).matches()) {
            return email;
        }

        String digits = onlyDigits(value);
        if (digits.length() == 11 || digits.length() == 14) {
            return digits;
        }

        return value;
    }

    private String validateCpf(String value) {
        String cpf = onlyDigits(value);

        if (cpf.length() != 11 || cpf.chars().distinct().count() == 1
                || !hasValidCpfDigits(cpf)) {
            throw new InvalidPixKeyException("CPF inválido");
        }

        return cpf;
    }

    private String validateCnpj(String value) {
        String cnpj = onlyDigits(value);

        if (cnpj.length() != 14 || cnpj.chars().distinct().count() == 1
                || !hasValidCnpjDigits(cnpj)) {
            throw new InvalidPixKeyException("CNPJ inválido");
        }

        return cnpj;
    }

    private String validateEmail(String value) {
        String email = value.trim().toLowerCase(Locale.ROOT);

        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new InvalidPixKeyException("E-mail inválido");
        }

        return email;
    }

    private String validatePhone(String value) {
        String phone = value.trim();

        if (!PHONE_PATTERN.matcher(phone).matches()) {
            throw new InvalidPixKeyException("Telefone inválido");
        }

        return phone;
    }

    private void validateOwnership(PixKeyType type, String key, UserModel user) {
        boolean owned = switch (type) {
            case CPF -> pessoaFisicaRepository.findByUserId(user.getId())
                    .map(person -> onlyDigits(person.getCpf()).equals(key))
                    .orElse(false);
            case CNPJ -> pessoaJuridicaRepository.findByUserId(user.getId())
                    .map(person -> onlyDigits(person.getCnpj()).equals(key))
                    .orElse(false);
            case EMAIL -> user.getEmail().equalsIgnoreCase(key);
            case CELULAR -> user.getTelefone().equals(key);
            case ALEATORIO -> true;
        };

        if (!owned) {
            throw new InvalidPixKeyException(
                    "A chave Pix deve pertencer ao usuário autenticado");
        }
    }

    private String onlyDigits(String value) {
        return value.replaceAll("\\D", "");
    }

    private boolean hasValidCpfDigits(String cpf) {
        int firstDigit = calculateDigit(cpf.substring(0, 9), 10);
        int secondDigit = calculateDigit(cpf.substring(0, 9) + firstDigit, 11);
        return cpf.equals(cpf.substring(0, 9) + firstDigit + secondDigit);
    }

    private boolean hasValidCnpjDigits(String cnpj) {
        int firstDigit = calculateCnpjDigit(cnpj.substring(0, 12));
        int secondDigit = calculateCnpjDigit(cnpj.substring(0, 12) + firstDigit);
        return cnpj.equals(cnpj.substring(0, 12) + firstDigit + secondDigit);
    }

    private int calculateDigit(String value, int factor) {
        int sum = 0;
        for (char digit : value.toCharArray()) {
            sum += Character.digit(digit, 10) * factor--;
        }

        int remainder = (sum * 10) % 11;
        return remainder == 10 ? 0 : remainder;
    }

    private int calculateCnpjDigit(String value) {
        int factor = value.length() - 7;
        int sum = 0;

        for (char digit : value.toCharArray()) {
            sum += Character.digit(digit, 10) * factor--;
            if (factor < 2) {
                factor = 9;
            }
        }

        int remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    }

    private PixKeyResponse toResponse(PixKey pixKey) {
        return new PixKeyResponse(
                pixKey.getId(),
                pixKey.getAccount().getId(),
                pixKey.getType(),
                pixKey.getKey(),
                pixKey.getCreatedAt());
    }
}
