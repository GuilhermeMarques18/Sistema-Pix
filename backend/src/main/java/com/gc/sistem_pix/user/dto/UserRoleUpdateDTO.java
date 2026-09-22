package com.gc.sistem_pix.user.dto;

import com.gc.sistem_pix.user.enums.UserRole;

import jakarta.validation.constraints.NotNull;

public record UserRoleUpdateDTO(
        @NotNull(message = "Role é obrigatória")
        UserRole role
) {}
