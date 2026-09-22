package com.gc.sistem_pix.user.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gc.sistem_pix.user.entity.UserModel;

public interface UserRepository extends JpaRepository<UserModel, UUID> {

    boolean existsByEmailAndIdNot(String email, UUID id);

    boolean existsByTelefoneAndIdNot(String telefone, UUID id);

    boolean existsByEmail(String email);

    boolean existsByTelefone(String telefone);

    Optional<UserModel> findByEmail(String email);

}
