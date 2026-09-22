package com.gc.sistem_pix.user.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import com.gc.sistem_pix.user.enums.TypePerson;
import com.gc.sistem_pix.user.enums.UserRole;

public record UserResponseDTO(
                UUID id,
                String name,
                String email,
                String telefone,
                TypePerson tipoPessoa,
                String documento,
                UserRole role,
                LocalDateTime createdUser) {

        public UserResponseDTO(
                        UUID id,
                        String name,
                        String email,
                        String telefone,
                        TypePerson tipoPessoa,
                        String documento,
                        LocalDateTime createdUser) {
                this(id, name, email, telefone, tipoPessoa, documento, UserRole.USER, createdUser);
        }
}
