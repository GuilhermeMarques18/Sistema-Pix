package com.gc.sistem_pix.user.dto;

import com.gc.sistem_pix.user.enumeration.TypePerson;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponseDTO(
        UUID id,
        String name,
        String email,
        String telefone,
        TypePerson tipoPessoa,
        String documento,
        LocalDateTime createdUser){
}
