package user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CNPJ;

public record LegalEntityDTO(
        @NotBlank @Size(min = 3, max = 150) String name,
        @NotBlank @Email String email,
        @NotBlank @Pattern(regexp = "\\+?[0-9]{10,13}") String telefone,
        @NotBlank String password,
        @NotBlank @CNPJ(message = "CNPJ inválido") String cnpj
) {}