package com.gc.sistem_pix.account.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record AccountResponseDTO(

        UUID id,

        String accountNumber,

        String agency,

        BigDecimal balance,

        BigDecimal transactionLimit,

        UUID userId,

        String ownerName,

        LocalDateTime createdAccount

) {
}