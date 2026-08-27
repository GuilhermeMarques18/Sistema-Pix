package user.dto;

import user.enumeration.TypePerson;

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
