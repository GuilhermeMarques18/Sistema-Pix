package com.gc.sistem_pix.account.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.gc.sistem_pix.account.enums.AccountStatus;
import com.gc.sistem_pix.account.enums.AccountType;

public record AccountResponseDTO(
                UUID id,
                UUID userId,
                String ownerName,
                BigDecimal balance,
                AccountStatus status,
                AccountType type,
                Integer transactionLimit,
                Integer pixLimit,
                LocalDateTime createdAccount) {
}
