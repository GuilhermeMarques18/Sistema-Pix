package com.gc.sistem_pix.account.repository;

import java.util.Optional;
import java.util.UUID;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.gc.sistem_pix.account.entity.AccountModel;

public interface AccountRepository extends JpaRepository<AccountModel, UUID> {

    Optional<AccountModel> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT account FROM AccountModel account WHERE account.id = :id")
    Optional<AccountModel> findByIdForUpdate(@Param("id") UUID id);
}
