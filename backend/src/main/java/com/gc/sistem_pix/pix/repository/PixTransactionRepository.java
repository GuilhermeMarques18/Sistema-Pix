package com.gc.sistem_pix.pix.repository;

import java.util.UUID;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gc.sistem_pix.pix.entity.PixTransaction;

public interface PixTransactionRepository extends JpaRepository<PixTransaction, UUID> {

    List<PixTransaction> findAllByOrderByDataHoraDesc();

    List<PixTransaction> findAllByContaOrigemIdOrContaDestinoIdOrderByDataHoraDesc(
            UUID contaOrigemId,
            UUID contaDestinoId);
}
