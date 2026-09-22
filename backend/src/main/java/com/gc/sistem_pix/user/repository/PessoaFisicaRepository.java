package com.gc.sistem_pix.user.repository;

import com.gc.sistem_pix.user.entity.PessoaFisicaModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PessoaFisicaRepository extends JpaRepository<PessoaFisicaModel, UUID> {

    Optional<PessoaFisicaModel> findByUserId(UUID userId);

    boolean existsByCpf(String cpf);
}
