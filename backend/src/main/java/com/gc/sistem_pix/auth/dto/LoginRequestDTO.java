package com.gc.sistem_pix.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import com.gc.sistem_pix.user.dto.UserInputNormalizer;

public record LoginRequestDTO(
        @Schema(description = "E-mail cadastrado", example = "usuario@email.com")
        @NotBlank @Email @Size(max = 255) String email,

        @Schema(description = "Senha do usuário", example = "Senha@123", format = "password")
        @NotBlank @Size(min = 6, max = 72, message = "A senha deve ter de 6 a 72 caracteres") String password
) {
    public LoginRequestDTO {
        email = UserInputNormalizer.email(email);
    }
}
