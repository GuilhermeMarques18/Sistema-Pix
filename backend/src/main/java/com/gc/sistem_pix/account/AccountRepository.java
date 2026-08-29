package com.gc.sistem_pix.account;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<AccountModel, UUID> {

    Optional<AccountModel> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    boolean existsByAccountNumber(String accountNumber);
}