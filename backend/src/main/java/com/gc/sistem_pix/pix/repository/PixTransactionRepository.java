package com.gc.sistem_pix.pix.repository;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gc.sistem_pix.pix.entity.PixTransaction;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PixTransactionRepository extends JpaRepository<PixTransaction, UUID> {

    List<PixTransaction> findAllByOrderByDataHoraDesc();

    List<PixTransaction> findAllByContaOrigemIdOrContaDestinoIdOrderByDataHoraDesc(
            UUID contaOrigemId,
            UUID contaDestinoId);

    @Query("""
        SELECT t FROM PixTransaction t
        WHERE (t.contaOrigemId = :contaId OR t.contaDestinoId = :contaId)
          AND t.dataHora BETWEEN :inicio AND :fim
        ORDER BY t.dataHora DESC
        """)
    List<PixTransaction> findAllByContaIdAndPeriodo(
            @Param("contaId") UUID contaId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim);
}
