package com.gc.sistem_pix.pix.repository;

import com.gc.sistem_pix.pix.entity.PixContact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PixContactRepository extends JpaRepository<PixContact, UUID> {

    List<PixContact> findAllByUser_IdOrderByNomeAsc(UUID userId);

    Optional<PixContact> findByIdAndUser_Id(UUID id, UUID userId);

    boolean existsByUser_IdAndChavePix(UUID userId, String chavePix);

    boolean existsByUser_IdAndChavePixAndIdNot(
            UUID userId,
            String chavePix,
            UUID id);
}
