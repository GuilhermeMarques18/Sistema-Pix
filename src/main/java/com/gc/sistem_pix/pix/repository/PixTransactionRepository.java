package com.gc.sistem_pix.pix.repository;

import com.gc.sistem_pix.pix.entity.PixTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface PixTransactionRepository extends JpaRepository<PixTransaction, UUID> {
}
