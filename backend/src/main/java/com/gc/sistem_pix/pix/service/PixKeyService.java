package com.gc.sistem_pix.pix.service;

import com.gc.sistem_pix.account.entity.AccountModel;
import com.gc.sistem_pix.account.repository.AccountRepository;
import com.gc.sistem_pix.pix.dto.CreatePixKeyRequest;
import com.gc.sistem_pix.pix.dto.PixKeyResponse;
import com.gc.sistem_pix.pix.dto.PixKeyValidationResponse;
import com.gc.sistem_pix.pix.dto.UpdatePixKeyRequest;
import com.gc.sistem_pix.pix.entity.PixKey;
import com.gc.sistem_pix.pix.enums.PixKeyType;
import com.gc.sistem_pix.pix.exception.InvalidPixKeyException;
import com.gc.sistem_pix.pix.repository.PixKeyRepository;
import com.gc.sistem_pix.user.entity.UserModel;
import com.gc.sistem_pix.user.exception.DuplicateResourceException;
import com.gc.sistem_pix.user.exception.ResourceNotFoundException;
import com.gc.sistem_pix.user.repository.PessoaFisicaRepository;
import com.gc.sistem_pix.user.repository.PessoaJuridicaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PixKeyService {

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

    @Transactional
    public PixKeyResponse update(UUID id, UpdatePixKeyRequest request, UserModel authenticatedUser) {
        if (authenticatedUser == null || authenticatedUser.getId() == null) {
            throw new InvalidPixKeyException("Usuário autenticado é obrigatório");
        }

        if (id == null) {
            throw new InvalidPixKeyException("ID da chave Pix é obrigatório");
        }

        if (request == null || request.tipo() == null) {
            throw new InvalidPixKeyException("Tipo da chave Pix é obrigatório");
        }

        PixKey pixKey = pixKeyRepository.findByIdAndAccount_User_Id(id, authenticatedUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Chave Pix não encontrada"));

        if (pixKey.getType() == PixKeyType.CPF || pixKey.getType() == PixKeyType.CNPJ) {
            throw new InvalidPixKeyException("Chaves Pix de CPF e CNPJ não podem ser alteradas");
        }

        if (request.tipo() != pixKey.getType()) {
            throw new InvalidPixKeyException("O tipo da chave Pix não pode ser alterado");
        }

        String normalizedKey;
        if (pixKey.getType() == PixKeyType.ALEATORIO) {
            if (request.chave() != null) {
                throw new InvalidPixKeyException(
                        "Não informe o valor da chave aleatória; ela é gerada automaticamente");
            }
            normalizedKey = UUID.randomUUID().toString();
        } else {
            normalizedKey = normalizeAndValidateFormat(request.tipo(), request.chave());
        }

        if (pixKeyRepository.existsByKeyAndIdNot(normalizedKey, id)) {
            throw new DuplicateResourceException("Chave Pix já cadastrada");
        }

        pixKey.setKey(normalizedKey);

        try {
            return toResponse(pixKeyRepository.saveAndFlush(pixKey));
        } catch (DataIntegrityViolationException exception) {
            throw new DuplicateResourceException(
                    "Não foi possível atualizar: a chave Pix conflita com um registro existente");
        }
    }

    @Transactional(readOnly = true)
    public PixKeyValidationResponse validate(PixKeyType type, String key) {
        String normalizedKey = normalizeAndValidateFormat(type, key);
        Optional<PixKey> pixKey = pixKeyRepository.findByKey(normalizedKey).filter(value -> value.getType() == type);

        return new PixKeyValidationResponse(
                true,
                pixKey.isPresent(),
                type,
                normalizedKey,
                pixKey.map(value -> value.getAccount().getId()).orElse(null));
    }

    @Transactional(readOnly = true)
    public PixKey findByKeyForTransfer(PixKeyType type, String key) {
        String normalized = PixKeyNormalizer.normalize(type, key);
        return pixKeyRepository.findByKey(normalized).filter(value -> value.getType() == type)
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

        if (type == PixKeyType.CPF) {
            key = pessoaFisicaRepository.findByUserId(authenticatedUser.getId())
                    .map(person -> person.getCpf())
                    .orElseThrow(() -> new InvalidPixKeyException(
                            "CPF não encontrado para o usuário autenticado"));
        }

        if (type == PixKeyType.CNPJ) {
            key = pessoaJuridicaRepository.findByUserId(authenticatedUser.getId())
                    .map(person -> person.getCnpj())
                    .orElseThrow(() -> new InvalidPixKeyException("CNPJ não encontrado para o usuário autenticado"));
        }

        String normalizedKey = normalizeAndValidateFormat(type, key);
        validateOwnership(type, normalizedKey, authenticatedUser);
        return normalizedKey;
    }

    private String normalizeAndValidateFormat(PixKeyType type, String key) {
        return PixKeyNormalizer.normalize(type, key);
    }

    private void validateOwnership(PixKeyType type, String key, UserModel user) {
        boolean owned = switch (type) {
            case CPF -> pessoaFisicaRepository.findByUserId(user.getId())
                    .map(person -> onlyDigits(person.getCpf()).equals(key))
                    .orElse(false);
            case CNPJ -> pessoaJuridicaRepository.findByUserId(user.getId())
                    .map(person -> onlyDigits(person.getCnpj()).equals(key))
                    .orElse(false);
            case EMAIL, CELULAR, ALEATORIO -> true;
        };

        if (!owned) {
            throw new InvalidPixKeyException(
                    "A chave Pix deve pertencer ao usuário autenticado");
        }
    }

    private String onlyDigits(String value) {
        return value.replaceAll("\\D", "");
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
