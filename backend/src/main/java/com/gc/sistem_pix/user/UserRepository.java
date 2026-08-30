package com.gc.sistem_pix.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<UserModel, UUID> {
    boolean existsByEmail(String email);

    boolean existsByTelefone(String telefone);

    Optional<UserModel> findByEmail(String email);

    boolean existsByDocs(String docs);
}