package com.gc.sistem_pix.pix.repository;

import com.gc.sistem_pix.pix.entity.PixKey;
import com.gc.sistem_pix.pix.enums.PixKeyType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;
import java.util.UUID;

public interface PixKeyRepository extends JpaRepository<PixKey, UUID> {

    boolean existsByKey(String key);

    boolean existsByAccount_IdAndType(UUID accountId, PixKeyType type);

    Optional<PixKey> findByKey(String key);

    List<PixKey> findAllByAccount_IdOrderByCreatedAtDesc(UUID accountId);
}
