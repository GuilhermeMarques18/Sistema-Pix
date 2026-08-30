package com.gc.sistem_pix.user.repository;

import com.gc.sistem_pix.user.entity.PessoaJuridicaModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PessoaJuridicaRepository extends JpaRepository<PessoaJuridicaModel, UUID> {

    Optional<PessoaJuridicaModel> findByUserId(UUID userId);

    boolean existsByCnpj(String cnpj);
}
