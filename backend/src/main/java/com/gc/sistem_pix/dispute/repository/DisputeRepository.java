package com.gc.sistem_pix.dispute.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gc.sistem_pix.dispute.entity.DisputeModel;
import com.gc.sistem_pix.dispute.enums.DisputeStatus;

@Repository
public interface DisputeRepository extends JpaRepository<DisputeModel, UUID> {

    boolean existsByTransacaoIdTransacao(UUID idTransacao);

    Optional<DisputeModel> findByTransacaoIdTransacao(UUID idTransacao);

    List<DisputeModel> findAllByContaDestinoIdOrContaSolicitanteIdOrderByCriadoEmDesc(
            UUID contaDestinoId,
            UUID contaSolicitanteId
    );

    List<DisputeModel> findAllByStatusOrderByCriadoEmDesc(DisputeStatus status);

    List<DisputeModel> findAllByOrderByCriadoEmDesc();
}
