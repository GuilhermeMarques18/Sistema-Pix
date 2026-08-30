package com.gc.sistem_pix.account.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gc.sistem_pix.account.dto.AccountRequestDTO;
import com.gc.sistem_pix.account.dto.AccountResponseDTO;
import com.gc.sistem_pix.account.dto.AccountUpdateDTO;
import com.gc.sistem_pix.account.entity.AccountModel;
import com.gc.sistem_pix.account.enums.AccountStatus;
import com.gc.sistem_pix.account.enums.AccountType;
import com.gc.sistem_pix.account.repository.AccountRepository;
import com.gc.sistem_pix.user.entity.UserModel;
import com.gc.sistem_pix.user.exception.DuplicateResourceException;
import com.gc.sistem_pix.user.exception.ResourceNotFoundException;
import com.gc.sistem_pix.user.repository.PessoaFisicaRepository;
import com.gc.sistem_pix.user.repository.PessoaJuridicaRepository;
import com.gc.sistem_pix.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final PessoaFisicaRepository pessoaFisicaRepository;
    private final PessoaJuridicaRepository pessoaJuridicaRepository;

    @Transactional
    public AccountResponseDTO createAccount(AccountRequestDTO dto) {
        if (dto == null || dto.userId() == null) {
            throw new IllegalArgumentException("Usuário é obrigatório");
        }

        UserModel user = userRepository.findById(dto.userId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        return createDefaultAccount(user);
    }

    @Transactional
    public AccountResponseDTO createDefaultAccount(UserModel user) {
        if (user == null || user.getId() == null) {
            throw new IllegalArgumentException("Usuário é obrigatório");
        }

        if (accountRepository.existsByUserId(user.getId())) {
            throw new DuplicateResourceException("Usuário já possui uma conta bancária");
        }

        AccountModel account = AccountModel.builder()
                .user(user)
                .status(AccountStatus.DESBLOQUEADA)
                .type(resolveAccountType(user.getId()))
                .build();

        return toResponseDTO(accountRepository.save(account));
    }

    @Transactional(readOnly = true)
    public AccountResponseDTO findByUserId(UUID userId) {
        AccountModel account = accountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Conta não encontrada para este usuário"));

        return toResponseDTO(account);
    }

    @Transactional(readOnly = true)
    public AccountResponseDTO findById(UUID accountId) {
        AccountModel account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada"));

        return toResponseDTO(account);
    }

    @Transactional(readOnly = true)
    public List<AccountResponseDTO> findAll() {
        return accountRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional
    public AccountResponseDTO updateOwn(UUID userId, AccountUpdateDTO dto) {
        AccountModel account = accountRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada"));

        if (dto.transactionLimit() != null) {
            account.setTransactionLimit(dto.transactionLimit());
        }
        if (dto.pixLimit() != null) {
            account.setPixLimit(dto.pixLimit());
        }

        return toResponseDTO(accountRepository.save(account));
    }

    @Transactional
    public void delete(UUID accountId) {
        AccountModel account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Conta não encontrada"));

        account.setAtivo(false);
        account.setDeletedAt(LocalDateTime.now());
        accountRepository.save(account);
    }

    private AccountType resolveAccountType(UUID userId) {
        if (pessoaFisicaRepository.findByUserId(userId).isPresent()) {
            return AccountType.PESSOA_FISICA;
        }
        if (pessoaJuridicaRepository.findByUserId(userId).isPresent()) {
            return AccountType.PESSOA_JURIDICA;
        }

        throw new IllegalStateException(
                "Usuário deve possuir pessoa física ou pessoa jurídica");
    }

    private AccountResponseDTO toResponseDTO(AccountModel account) {
        return new AccountResponseDTO(
                account.getId(),
                account.getUser().getId(),
                account.getUser().getName(),
                account.getBalance(),
                account.getStatus(),
                account.getType(),
                account.getTransactionLimit(),
                account.getPixLimit(),
                account.getCreatedAccount());
    }
}
