package user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import user.dto.LegalEntityDTO;
import user.dto.NaturalPersonDTO;
import user.dto.UserResponseDTO;
import user.enumeration.TypePerson;
import user.exception.DuplicateResourceException;
import user.exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UserResponseDTO createNaturalPerson(NaturalPersonDTO dto) {
        validateUniqueness(dto.email(), dto.telefone(), dto.cpf());

        UserModel user = UserModel.builder()
                .name(dto.name())
                .email(dto.email())
                .password(passwordEncoder.encode(dto.password()))
                .telefone(dto.telefone())
                .docs(dto.cpf())
                .typePerson(TypePerson.FISICA)
                .build();

        return toResponseDTO(userRepository.save(user));
    }

    @Transactional
    public UserResponseDTO createLegalEntity(LegalEntityDTO dto) {
        validateUniqueness(dto.email(), dto.telefone(), dto.cnpj());

        UserModel user = UserModel.builder()
                .name(dto.name())
                .email(dto.email())
                .password(passwordEncoder.encode(dto.password()))
                .telefone(dto.telefone())
                .docs(dto.cnpj())
                .typePerson(TypePerson.JURIDICA)
                .build();

        return toResponseDTO(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public UserResponseDTO searchID(UUID id) {
        return userRepository.findById(id)
                .map(this::toResponseDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> listAll() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional
    public void remover(UUID id) {
        UserModel user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado: " + id));

        user.setAtivo(false);
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    private void validateUniqueness(String email, String telefone, String docs) {
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Email já cadastrado: " + email);
        }
        if (userRepository.existsByTelefone(telefone)) {
            throw new DuplicateResourceException("Telefone já cadastrado: " + telefone);
        }
        if (userRepository.existsByDocs(docs)) {
            throw new DuplicateResourceException("Documento já cadastrado: " + docs);
        }
    }

    private UserResponseDTO toResponseDTO(UserModel user) {
        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getTelefone(),
                user.getTypePerson(),
                user.getDocs(),
                user.getCreatedUser()
        );
    }
}