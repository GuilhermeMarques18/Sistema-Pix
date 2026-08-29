package com.gc.sistem_pix.pix.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gc.sistem_pix.pix.entity.PixTransaction;

public interface PixTransactionRepository extends JpaRepository<PixTransaction, UUID> {
}
