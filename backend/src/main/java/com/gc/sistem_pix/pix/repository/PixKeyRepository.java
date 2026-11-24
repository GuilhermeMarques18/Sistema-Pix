package com.gc.sistem_pix.pix.repository;

import com.gc.sistem_pix.pix.entity.PixKey;
import com.gc.sistem_pix.pix.enums.PixKeyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

public interface PixKeyRepository extends JpaRepository<PixKey, UUID> {

    boolean existsByKey(String key);

    boolean existsByAccount_IdAndType(UUID accountId, PixKeyType type);

    Optional<PixKey> findByKey(String key);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT pixKey FROM PixKey pixKey WHERE pixKey.key = :key")
    Optional<PixKey> findByKeyForUpdate(@Param("key") String key);

    List<PixKey> findAllByAccount_IdOrderByCreatedAtDesc(UUID accountId);

    Optional<PixKey> findByIdAndAccount_User_Id(UUID id, UUID userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT pixKey FROM PixKey pixKey WHERE pixKey.id = :id AND pixKey.account.user.id = :userId")
    Optional<PixKey> findOwnedByIdForUpdate(@Param("id") UUID id, @Param("userId") UUID userId);

    boolean existsByKeyAndIdNot(String key, UUID id);
}
