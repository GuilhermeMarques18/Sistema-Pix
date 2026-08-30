package com.gc.sistem_pix.user.dto;

import com.gc.sistem_pix.user.enums.NotificationType;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UserUpdateDTO(
                @Schema(description = "Nome completo do usuário", example = "Maria da Silva")
                @Size(min = 3, max = 150) String name,

                @Schema(description = "Novo e-mail do usuário", example = "maria.nova@email.com")
                @Email String email,

                @Schema(description = "Novo telefone do usuário", example = "+5585999999999")
                @Pattern(regexp = "\\+?[0-9]{10,13}", message = "Telefone inválido") String telefone,

                @Schema(description = "Canal preferencial para notificações", example = "EMAIL")
                NotificationType notificationType) {
}
