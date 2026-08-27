package user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.br.CPF;

public record NaturalPersonDTO(
        @NotBlank @Size(min = 3, max = 150) String name,
        @NotBlank @Email String email,
        @NotBlank @Pattern(regexp = "\\+?[0-9]{10,13}") String telefone,
        @NotBlank @CPF(message = "CPF inválido") String cpf
) {}