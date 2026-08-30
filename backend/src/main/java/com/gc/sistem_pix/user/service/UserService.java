package com.gc.sistem_pix.user.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gc.sistem_pix.account.service.AccountService;
import com.gc.sistem_pix.user.dto.LegalEntityDTO;
import com.gc.sistem_pix.user.dto.NaturalPersonDTO;
import com.gc.sistem_pix.user.dto.UserResponseDTO;
import com.gc.sistem_pix.user.dto.UserUpdateDTO;
import com.gc.sistem_pix.user.entity.PessoaFisicaModel;
import com.gc.sistem_pix.user.entity.PessoaJuridicaModel;
import com.gc.sistem_pix.user.entity.UserModel;
import com.gc.sistem_pix.user.enums.TypePerson;
import com.gc.sistem_pix.user.exception.DuplicateResourceException;
import com.gc.sistem_pix.user.exception.ResourceNotFoundException;
import com.gc.sistem_pix.user.repository.PessoaFisicaRepository;
import com.gc.sistem_pix.user.repository.PessoaJuridicaRepository;
import com.gc.sistem_pix.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PessoaFisicaRepository pessoaFisicaRepository;
    private final PessoaJuridicaRepository pessoaJuridicaRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccountService accountService;

    @Transactional
    public UserResponseDTO createNaturalPerson(NaturalPersonDTO dto) {
        validateUserUniqueness(dto.email(), dto.telefone());

        if (pessoaFisicaRepository.existsByCpf(dto.cpf())) {
            throw new DuplicateResourceException("CPF já cadastrado: " + dto.cpf());
        }

        UserModel user = userRepository.save(buildUser(dto.name(), dto.email(), dto.password(), dto.telefone()));

        pessoaFisicaRepository.save(PessoaFisicaModel.builder()
                .user(user)
                .cpf(dto.cpf())
                .build());

        accountService.createDefaultAccount(user);

        return toResponseDTO(user);
    }

    @Transactional
    public UserResponseDTO createLegalEntity(LegalEntityDTO dto) {
        validateUserUniqueness(dto.email(), dto.telefone());

        if (pessoaJuridicaRepository.existsByCnpj(dto.cnpj())) {
            throw new DuplicateResourceException("CNPJ já cadastrado: " + dto.cnpj());
        }

        UserModel user = userRepository.save(buildUser(dto.name(), dto.email(), dto.password(), dto.telefone()));

        pessoaJuridicaRepository.save(PessoaJuridicaModel.builder()
                .user(user)
                .cnpj(dto.cnpj())
                .build());

        accountService.createDefaultAccount(user);

        return toResponseDTO(user);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO searchID(UUID id) {
        return userRepository.findById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> listAll() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional
    public UserResponseDTO update(UUID userId, UserUpdateDTO dto) {
        validateUpdateRequest(dto);

        UserModel user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        if (dto.name() != null) {
            user.setName(dto.name());
        }

        if (dto.email() != null && !dto.email().equals(user.getEmail())) {
            if (userRepository.existsByEmailAndIdNot(dto.email(), userId)) {
                throw new DuplicateResourceException("E-mail já cadastrado");
            }

            user.setEmail(dto.email());
        }

        if (dto.telefone() != null && !dto.telefone().equals(user.getTelefone())) {
            if (userRepository.existsByTelefoneAndIdNot(dto.telefone(), userId)) {
                throw new DuplicateResourceException("Telefone já cadastrado");
            }

            user.setTelefone(dto.telefone());
        }

        if (dto.notificationType() != null) {
            user.setNotificationType(dto.notificationType());
        }

        return toResponseDTO(userRepository.save(user));
    }

    private void validateUpdateRequest(UserUpdateDTO dto) {
        if (dto == null
                || (dto.name() == null
                && dto.email() == null
                && dto.telefone() == null
                && dto.notificationType() == null)) {
            throw new IllegalArgumentException(
                    "Informe pelo menos um campo para atualização");
        }

        if (dto.name() != null && dto.name().isBlank()) {
            throw new IllegalArgumentException("Nome não pode estar vazio");
        }

        if (dto.email() != null && dto.email().isBlank()) {
            throw new IllegalArgumentException("E-mail não pode estar vazio");
        }

        if (dto.telefone() != null && dto.telefone().isBlank()) {
            throw new IllegalArgumentException("Telefone não pode estar vazio");
        }
    }

    @Transactional
    public void remover(UUID id) {
        UserModel user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + id));

        user.setAtivo(false);
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    private UserModel buildUser(String name, String email, String password, String telefone) {
        return UserModel.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(password))
                .telefone(telefone)
                .build();
    }

    private void validateUserUniqueness(String email, String telefone) {
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email já cadastrado: " + email);
        }
        if (userRepository.existsByTelefone(telefone)) {
            throw new DuplicateResourceException("Telefone já cadastrado: " + telefone);
        }
    }

    private UserResponseDTO toResponseDTO(UserModel user) {
        return pessoaFisicaRepository.findByUserId(user.getId())
                .map(pessoa -> new UserResponseDTO(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getTelefone(),
                        TypePerson.FISICA,
                        pessoa.getCpf(),
                        user.getCreatedUser()))
                .orElseGet(() -> pessoaJuridicaRepository.findByUserId(user.getId())
                        .map(pessoa -> new UserResponseDTO(
                                user.getId(),
                                user.getName(),
                                user.getEmail(),
                                user.getTelefone(),
                                TypePerson.JURIDICA,
                                pessoa.getCnpj(),
                                user.getCreatedUser()))
                        .orElseThrow(() -> new IllegalStateException(
                                "Usuário deve possuir pessoa física ou pessoa jurídica")));
    }
}
