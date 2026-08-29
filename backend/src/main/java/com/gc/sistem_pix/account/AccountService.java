package com.gc.sistem_pix.account;

import com.gc.sistem_pix.account.dto.AccountRequestDTO;
import com.gc.sistem_pix.account.dto.AccountResponseDTO;
import com.gc.sistem_pix.account.dto.AccountUpdateDTO;
import com.gc.sistem_pix.user.UserModel;
import com.gc.sistem_pix.user.UserRepository;
import com.gc.sistem_pix.user.exception.DuplicateResourceException;
import com.gc.sistem_pix.user.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AccountService {

    private static final String AGENCY_DEFAULT = "0001";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    public AccountResponseDTO createAccount(AccountRequestDTO dto) {

        UserModel user = userRepository.findById(dto.userId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Usuário não encontrado"));

        if (accountRepository.existsByUserId(user.getId())) {
            throw new DuplicateResourceException(
                    "Usuário já possui uma conta bancária");
        }

        AccountModel account = AccountModel.builder()
                .user(user)
                .accountNumber(generateAccountNumber())
                .agency(AGENCY_DEFAULT)
                .build();

        AccountModel savedAccount = accountRepository.save(account);

        return toResponseDTO(savedAccount);
    }

    public AccountResponseDTO findByUserId(UUID userId) {

        AccountModel account = accountRepository.findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Conta não encontrada para este usuário"));

        return toResponseDTO(account);
    }

    public AccountResponseDTO findById(UUID accountId) {

        AccountModel account = accountRepository.findById(accountId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Conta não encontrada"));

        return toResponseDTO(account);
    }

    public AccountResponseDTO update(
            UUID accountId,
            AccountUpdateDTO dto) {

        AccountModel account = accountRepository.findById(accountId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Conta não encontrada"));

        account.setTransactionLimit(dto.transactionLimit());

        AccountModel updatedAccount = accountRepository.save(account);

        return toResponseDTO(updatedAccount);
    }

    public void delete(UUID accountId) {

        AccountModel account = accountRepository.findById(accountId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Conta não encontrada"));

        account.setAtivo(false);
        account.setDeletedAt(LocalDateTime.now());

        accountRepository.save(account);
    }

    private String generateAccountNumber() {

        String accountNumber;

        do {
            accountNumber = String.format(
                    "%08d",
                    RANDOM.nextInt(100_000_000)
            );
        } while (accountRepository.existsByAccountNumber(accountNumber));

        return accountNumber;
    }

    private AccountResponseDTO toResponseDTO(AccountModel account) {

        return new AccountResponseDTO(
                account.getId(),
                account.getAccountNumber(),
                account.getAgency(),
                account.getBalance(),
                account.getTransactionLimit(),
                account.getUser().getId(),
                account.getUser().getName(),
                account.getCreatedAccount()
        );
    }
}