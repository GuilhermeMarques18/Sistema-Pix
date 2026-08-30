package com.gc.sistem_pix.user.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.gc.sistem_pix.user.enums.TypePerson;

public record UserResponseDTO(
                UUID id,
                String name,
                String email,
                String telefone,
                TypePerson tipoPessoa,
                String documento,
                LocalDateTime createdUser) {
}
