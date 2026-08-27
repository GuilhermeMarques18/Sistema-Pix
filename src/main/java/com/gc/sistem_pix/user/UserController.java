package user;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import user.dto.LegalEntityDTO;
import user.dto.NaturalPersonDTO;
import user.dto.UserResponseDTO;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/pessoa-fisica")
    public ResponseEntity<UserResponseDTO> creatNaturalPerson(@Valid @RequestBody NaturalPersonDTO dto) {
        UserResponseDTO response = userService.createNaturalPerson(dto);
        return ResponseEntity.created(URI.create("/api/users/" + response.id())).body(response);
    }

    @PostMapping("/pessoa-juridica")
    public ResponseEntity<UserResponseDTO> creatLegalEntity(@Valid @RequestBody LegalEntityDTO dto) {
        UserResponseDTO response = userService.createLegalEntity(dto);
        return ResponseEntity.created(URI.create("/api/users/" + response.id())).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> findID(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.searchID(id));
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> listAll() {
        return ResponseEntity.ok(userService.listAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remover(@PathVariable UUID id) {
        userService.remover(id);
        return ResponseEntity.noContent().build();
    }
}