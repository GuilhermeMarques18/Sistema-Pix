package com.gc.sistem_pix.user.dto;

import org.hibernate.validator.constraints.br.CNPJ;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record LegalEntityDTO(
                @Schema(example = "Empresa Exemplo LTDA") @NotBlank @Size(min = 3, max = 150) String name,

                @Schema(example = "contato@empresa.com") @NotBlank @Email String email,

                @Schema(example = "Senha@123", format = "password") @NotBlank String password,

                @Schema(example = "+5585999999999") @NotBlank @Pattern(regexp = "\\+?[0-9]{10,13}") String telefone,

                @Schema(example = "11222333000181") @NotBlank @CNPJ(message = "CNPJ inválido") String cnpj) {
}
